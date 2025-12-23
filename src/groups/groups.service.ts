import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ChildGroup } from '../common/enums/activity.enum';
import { MonitorLevel, UserRole, LifecycleStatus } from '../common/enums/user.enum';
import {
    NotificationContextType,
    ReminderKind,
    ReminderStatus,
} from '../common/enums/notification.enum';
import { NotificationService } from '../notifications/notifications.service';
import { Settings, SettingsDocument } from '../schema/settings.schema';
import { User, UserDocument } from '../schema/user.schema';
import { ChildProfile, ChildProfileDocument } from '../schema/child-profile.schema';
import { MonitorProfile, MonitorProfileDocument } from '../schema/monitor-profile.schema';
import { Reminder, ReminderDocument } from '../schema/reminder.schema';
import { DEFAULT_AGE_TO_GROUP_MAPPING, AgeBand } from '../common/constants/groups.constants';
import { computeAgeYears, startOfDayKey } from '../common/utils/groups.util';
import { AppConfigService } from '../config/app-config.service';
import { computeGroupFromAge } from '../common/utils/age-group.util';

@Injectable()
export class GroupsService {
    private readonly logger = new Logger(GroupsService.name);

    constructor(
        @InjectModel(Settings.name) private readonly settingsModel: Model<SettingsDocument>,
        @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
        @InjectModel(ChildProfile.name)
        private readonly childProfileModel: Model<ChildProfileDocument>,
        @InjectModel(MonitorProfile.name)
        private readonly monitorProfileModel: Model<MonitorProfileDocument>,
        @InjectModel(Reminder.name) private readonly reminderModel: Model<ReminderDocument>,
        private readonly notificationService: NotificationService,
        private readonly config: AppConfigService,
    ) {}

    async getAgeToGroupMapping(): Promise<{ bands: AgeBand[] }> {
        const existing = await this.settingsModel
            .findOne({ key: 'ageToGroupMapping' })
            .lean()
            .exec();
        if (existing?.value?.bands?.length) {
            return { bands: existing.value.bands as AgeBand[] };
        }

        // Seed defaults if not present.
        await this.settingsModel.findOneAndUpdate(
            { key: 'ageToGroupMapping' },
            { $set: { value: { bands: DEFAULT_AGE_TO_GROUP_MAPPING } } },
            { upsert: true },
        );
        return { bands: DEFAULT_AGE_TO_GROUP_MAPPING };
    }

    async recomputeAllChildren(asOf: Date = new Date()) {
        const mapping = await this.getAgeToGroupMapping();
        const dayKey = startOfDayKey(asOf);

        const children = await this.userModel
            .find({
                role: UserRole.Child,
            })
            .lean()
            .exec();

        let processedChildren = 0;
        let updatedGroups = 0;
        let archivedAdults = 0;
        let remindersCreated = 0;

        for (const child of children) {
            processedChildren += 1;

            if (!child.dateOfBirth) {
                continue;
            }

            const ageYears = computeAgeYears(new Date(child.dateOfBirth), asOf);
            const shouldArchive = ageYears >= 19;

            const profile = await this.childProfileModel
                .findOne({ userId: child._id })
                .lean()
                .exec();

            const currentGroup = profile?.currentGroup as ChildGroup | undefined;
            const computedGroup = shouldArchive
                ? undefined
                : computeGroupFromAge(ageYears, mapping.bands);

            const needsGroupUpdate =
                !shouldArchive && computedGroup && computedGroup !== currentGroup;

            const justArchived =
                shouldArchive && child.lifecycleStatus !== LifecycleStatus.Archived;

            if (needsGroupUpdate) {
                updatedGroups += 1;
                await this.childProfileModel.findOneAndUpdate(
                    { userId: child._id },
                    {
                        $set: {
                            currentGroup: computedGroup,
                            groupComputedAt: asOf,
                        },
                    },
                    { upsert: true },
                );
            } else {
                await this.childProfileModel.findOneAndUpdate(
                    { userId: child._id },
                    {
                        $set: {
                            groupComputedAt: asOf,
                        },
                    },
                    { upsert: true },
                );
            }

            const lastReminderKey = profile?.lastGroupChangeReminderAt
                ? startOfDayKey(new Date(profile.lastGroupChangeReminderAt))
                : undefined;
            const canCreateReminderToday = lastReminderKey !== dayKey;

            if (canCreateReminderToday && (needsGroupUpdate || justArchived)) {
                remindersCreated += 1;
                await this.childProfileModel.findOneAndUpdate(
                    { userId: child._id },
                    { $set: { lastGroupChangeReminderAt: asOf } },
                    { upsert: true },
                );

                const newGroupLabel = justArchived ? 'Adult' : computedGroup;
                await this.createAndSendGroupChangeReminder({
                    childId: String(child._id),
                    childName: child.fullName,
                    originTown: child.originTown,
                    oldGroup: currentGroup,
                    newGroup: newGroupLabel,
                });
            }

            if (justArchived) {
                archivedAdults += 1;
                await this.userModel.findByIdAndUpdate(child._id, {
                    $set: {
                        lifecycleStatus: LifecycleStatus.Archived,
                        archivedReason: 'turned_19',
                    },
                });
            }
        }

        return { processedChildren, updatedGroups, archivedAdults, remindersCreated };
    }

    private async createAndSendGroupChangeReminder(params: {
        childId: string;
        childName: string;
        originTown?: string;
        oldGroup?: ChildGroup;
        newGroup?: string;
    }) {
        const recipients = await this.resolveRecipients(params.originTown);

        const message =
            params.newGroup === 'Adult'
                ? `Child "${params.childName}" has transitioned to Adult status (archived).`
                : `Child "${params.childName}" should move from group ${params.oldGroup ?? '-'} to ${
                      params.newGroup ?? '-'
                  }.`;

        const reminder = await this.reminderModel.create({
            kind: ReminderKind.GroupChange,
            message,
            channel: this.config.notificationProvider === 'whatsapp' ? 'whatsapp' : 'email',
            status: ReminderStatus.Active,
            recipients: recipients.map((r) => r.userId),
            awaitingAckUserIds: recipients.map((r) => r.userId),
            acknowledgedByUserIds: [],
            context: {
                childId: params.childId,
                oldGroup: params.oldGroup,
                newGroup: params.newGroup,
            },
        });

        for (const recipient of recipients) {
            const to =
                this.config.notificationProvider === 'whatsapp'
                    ? recipient.phoneE164
                    : recipient.email;
            if (!to) {
                continue;
            }
            await this.notificationService.send({
                userId: recipient.userId,
                to,
                subject: 'Group change reminder',
                message,
                templateName: 'generic-notification',
                templateData: {
                    subject: 'Group change reminder',
                    headline: 'Group change reminder',
                    message,
                },
                contextType: NotificationContextType.GroupChange,
                contextId: String(reminder._id),
            });
        }
    }

    private async resolveRecipients(originTown?: string) {
        const supers = await this.userModel
            .find({ role: UserRole.Monitor, monitorLevel: MonitorLevel.Super })
            .lean()
            .exec();

        let townMonitors: any[] = [];
        if (originTown) {
            const profiles = await this.monitorProfileModel
                .find({ homeTown: originTown })
                .lean()
                .exec();
            const ids = profiles.map((p) => p.userId);
            townMonitors = await this.userModel
                .find({ _id: { $in: ids } })
                .lean()
                .exec();
        }

        const users = [...supers, ...townMonitors];
        const seen = new Set<string>();
        return users
            .map((u) => ({
                userId: String(u._id),
                email: u.email as string | undefined,
                phoneE164: u.whatsApp?.phoneE164 as string | undefined,
            }))
            .filter((u) => {
                if (seen.has(u.userId)) return false;
                seen.add(u.userId);
                return true;
            });
    }
}
