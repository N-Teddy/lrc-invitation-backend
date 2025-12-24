import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TownScopeService } from '../common/services/town-scope.service';
import { MediaService } from '../media/media.service';
import { SettingsService } from '../settings/settings.service';
import { NotificationService } from '../notifications/notifications.service';
import { AppConfigService } from '../config/app-config.service';
import { User, UserDocument } from '../schema/user.schema';
import { ChildProfile, ChildProfileDocument } from '../schema/child-profile.schema';
import { CreateChildDto } from '../dtos/request/child.dto';
import { ChildGroup, Town } from '../common/enums/activity.enum';
import { LifecycleStatus, MonitorLevel, UserRole } from '../common/enums/user.enum';
import { computeGroupFromAge } from '../common/utils/age-group.util';
import { computeAgeYears } from '../common/utils/groups.util';
import { NotificationContextType } from '../common/enums/notification.enum';
import { UsersService } from '../users/users.service';
import { UploadedFile } from '../common/interfaces/uploaded-file.interface';

@Injectable()
export class ChildrenService {
    constructor(
        @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
        @InjectModel(ChildProfile.name)
        private readonly childProfileModel: Model<ChildProfileDocument>,
        private readonly townScopeService: TownScopeService,
        private readonly settingsService: SettingsService,
        private readonly mediaService: MediaService,
        private readonly notificationService: NotificationService,
        private readonly usersService: UsersService,
        private readonly config: AppConfigService,
    ) {}

    async list(
        filters: { q?: string; includeArchived?: boolean },
        currentUser: Record<string, any>,
    ) {
        const scopeTown = await this.resolveMonitorTownOrFail(currentUser);
        const isSuper = currentUser?.monitorLevel === MonitorLevel.Super;

        const q = (filters.q ?? '').trim();
        const includeArchived = !!filters.includeArchived && isSuper;

        const query: Record<string, any> = { role: UserRole.Child };
        if (!includeArchived) query.lifecycleStatus = LifecycleStatus.Active;
        if (!isSuper) query.originTown = scopeTown;
        if (q.length >= 2) {
            query.fullName = {
                $regex: q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
                $options: 'i',
            };
        }

        const users = await this.userModel.find(query).sort({ fullName: 1 }).lean().exec();
        if (!users.length) return [];

        const ids = users.map((u) => u._id);
        const profiles = await this.childProfileModel
            .find({ userId: { $in: ids } })
            .select({ userId: 1, currentGroup: 1 })
            .lean()
            .exec();
        const groupById = new Map<string, ChildGroup | undefined>();
        for (const p of profiles) {
            groupById.set(String(p.userId), p.currentGroup as ChildGroup | undefined);
        }

        return users.map((u) => ({
            ...u,
            group: groupById.get(String(u._id)),
        }));
    }

    async get(id: string, currentUser: Record<string, any>) {
        const scopeTown = await this.resolveMonitorTownOrFail(currentUser);
        const isSuper = currentUser?.monitorLevel === MonitorLevel.Super;

        const user = await this.userModel.findById(id).lean().exec();
        if (!user || user.role !== UserRole.Child) throw new NotFoundException('Child not found');

        if (!isSuper && user.originTown !== scopeTown) {
            throw new ForbiddenException('Not allowed to access other towns');
        }

        const profile = await this.childProfileModel.findOne({ userId: user._id }).lean().exec();
        return {
            ...user,
            group: profile?.currentGroup as ChildGroup | undefined,
        };
    }

    async create(
        dto: CreateChildDto,
        file: UploadedFile | undefined,
        currentUser: Record<string, any>,
    ) {
        const scopeTown = await this.resolveMonitorTownOrFail(currentUser);
        this.assertCanCreate(currentUser);

        const dob = new Date(dto.dateOfBirth);
        if (Number.isNaN(dob.getTime())) {
            throw new BadRequestException('Invalid dateOfBirth');
        }

        const ageYears = computeAgeYears(dob, new Date());
        if (ageYears < 0) {
            throw new BadRequestException('Invalid dateOfBirth');
        }
        if (ageYears >= 19) {
            throw new BadRequestException('Adults are out of scope (child must be 18 or younger)');
        }

        const profileImage = file ? await this.mediaService.uploadProfileImage(file) : undefined;

        const whatsApp = dto.whatsAppPhoneE164
            ? {
                  phoneE164: dto.whatsAppPhoneE164,
                  optIn: dto.whatsAppOptIn ?? true,
              }
            : undefined;

        const user = await new this.userModel({
            fullName: dto.fullName,
            role: UserRole.Child,
            dateOfBirth: dob,
            originTown: scopeTown,
            preferredLanguage: dto.preferredLanguage ?? 'en',
            whatsApp,
            profileImage,
            lifecycleStatus: LifecycleStatus.Active,
        }).save();

        const mapping = await this.settingsService.getAgeToGroupMapping();
        const group = computeGroupFromAge(ageYears, mapping.bands);
        await this.childProfileModel.findOneAndUpdate(
            { userId: user._id },
            { $set: { currentGroup: group, groupComputedAt: new Date() } },
            { upsert: true },
        );

        await this.notifyChildCreated({
            childId: String(user._id),
            childName: user.fullName,
            town: scopeTown,
            group,
        });

        return { ...user.toObject(), group };
    }

    async bulkCreate(children: CreateChildDto[], currentUser: Record<string, any>) {
        const scopeTown = await this.resolveMonitorTownOrFail(currentUser);
        this.assertCanCreate(currentUser);

        const mapping = await this.settingsService.getAgeToGroupMapping();
        const now = new Date();

        const created: any[] = [];
        const errors: Array<{ index: number; message: string }> = [];

        for (let i = 0; i < children.length; i += 1) {
            const item = children[i];
            try {
                const dob = new Date(item.dateOfBirth);
                if (Number.isNaN(dob.getTime())) {
                    throw new BadRequestException('Invalid dateOfBirth');
                }
                const ageYears = computeAgeYears(dob, now);
                if (ageYears < 0) {
                    throw new BadRequestException('Invalid dateOfBirth');
                }
                if (ageYears >= 19) {
                    throw new BadRequestException(
                        'Adults are out of scope (child must be 18 or younger)',
                    );
                }

                const whatsApp = item.whatsAppPhoneE164
                    ? {
                          phoneE164: item.whatsAppPhoneE164,
                          optIn: item.whatsAppOptIn ?? true,
                      }
                    : undefined;

                const user = await new this.userModel({
                    fullName: item.fullName,
                    role: UserRole.Child,
                    dateOfBirth: dob,
                    originTown: scopeTown,
                    preferredLanguage: item.preferredLanguage ?? 'en',
                    whatsApp,
                    lifecycleStatus: LifecycleStatus.Active,
                }).save();

                const group = computeGroupFromAge(ageYears, mapping.bands);
                await this.childProfileModel.findOneAndUpdate(
                    { userId: user._id },
                    { $set: { currentGroup: group, groupComputedAt: now } },
                    { upsert: true },
                );

                created.push({ ...user.toObject(), group });
            } catch (err) {
                const message = err?.message ?? 'Invalid child record';
                errors.push({ index: i, message });
            }
        }

        if (created.length) {
            await this.notifyChildrenBulkCreated({
                town: scopeTown,
                totalCreated: created.length,
                sampleNames: created.slice(0, 10).map((c) => c.fullName as string),
            });
        }

        return { created, errors };
    }

    async uploadProfileImage(
        childId: string,
        file: UploadedFile,
        currentUser: Record<string, any>,
    ) {
        if (!file) throw new BadRequestException('No file uploaded');
        const child = await this.userModel.findById(childId).lean().exec();
        if (!child || child.role !== UserRole.Child) throw new NotFoundException('Child not found');

        await this.assertCanManageChild(currentUser, child);

        const profileImage = await this.mediaService.uploadProfileImage(file);
        const updated = await this.userModel
            .findByIdAndUpdate(childId, { $set: { profileImage } }, { new: true })
            .lean()
            .exec();
        if (!updated) throw new NotFoundException('Child not found');

        const profile = await this.childProfileModel.findOne({ userId: updated._id }).lean().exec();
        return { ...updated, group: profile?.currentGroup as ChildGroup | undefined };
    }

    async archive(childId: string, currentUser: Record<string, any>) {
        const child = await this.userModel.findById(childId).lean().exec();
        if (!child || child.role !== UserRole.Child) throw new NotFoundException('Child not found');

        await this.assertCanManageChild(currentUser, child);

        const updated = await this.userModel
            .findByIdAndUpdate(
                childId,
                {
                    $set: {
                        lifecycleStatus: LifecycleStatus.Archived,
                        archivedReason: 'manual_archive',
                    },
                },
                { new: true },
            )
            .lean()
            .exec();
        if (!updated) throw new NotFoundException('Child not found');

        const profile = await this.childProfileModel.findOne({ userId: updated._id }).lean().exec();
        return { ...updated, group: profile?.currentGroup as ChildGroup | undefined };
    }

    private assertCanCreate(currentUser: Record<string, any>) {
        const level = currentUser?.monitorLevel as MonitorLevel | undefined;
        if (currentUser?.role !== UserRole.Monitor) {
            throw new ForbiddenException('Only monitors can create children');
        }
        if (level !== MonitorLevel.Official && level !== MonitorLevel.Super) {
            throw new ForbiddenException('Only Official and Super Monitors can create children');
        }
    }

    private async assertCanManageChild(
        currentUser: Record<string, any>,
        child: Record<string, any>,
    ) {
        this.assertCanCreate(currentUser);
        if (currentUser?.monitorLevel === MonitorLevel.Super) return;

        const town = await this.resolveMonitorTownOrFail(currentUser);
        if ((child.originTown as Town | undefined) !== town) {
            throw new ForbiddenException('Not allowed to manage other towns');
        }
    }

    private async resolveMonitorTownOrFail(currentUser: Record<string, any>): Promise<Town> {
        const town = await this.townScopeService.resolveMonitorTown(currentUser);
        if (!town) throw new ForbiddenException('Monitor town not set');
        return town;
    }

    private async notifyChildCreated(params: {
        childId: string;
        childName: string;
        town: Town;
        group?: ChildGroup;
    }) {
        const recipients = await this.usersService.findSuperMonitorsByTownForApproval(params.town);
        const fallback = recipients.length
            ? recipients
            : await this.usersService.findAllSuperMonitors();

        const appUrl = `${this.config.frontendBaseUrl}/children/${params.childId}`;
        const subject = `New child created — ${params.town}`;
        const message =
            `A child profile was created.\n\n` +
            `Name: ${params.childName}\n` +
            `Town: ${params.town}\n` +
            `Group: ${params.group ?? 'Unknown'}\n\n` +
            `Open: ${appUrl}`;

        for (const r of fallback) {
            const to = r.email;
            if (!to) continue;
            await this.notificationService.send({
                userId: r.id,
                to,
                subject,
                message,
                templateName: 'child-created',
                templateData: {
                    subject,
                    childName: params.childName,
                    town: params.town,
                    group: params.group ?? 'Unknown',
                    appUrl,
                },
                actions: [{ id: 'OPEN_CHILD', label: 'Open child', redirectUrl: appUrl }],
                contextType: NotificationContextType.Child,
                contextId: `child_created:${params.childId}`,
            });
        }
    }

    private async notifyChildrenBulkCreated(params: {
        town: Town;
        totalCreated: number;
        sampleNames: string[];
    }) {
        const recipients = await this.usersService.findSuperMonitorsByTownForApproval(params.town);
        const fallback = recipients.length
            ? recipients
            : await this.usersService.findAllSuperMonitors();

        const listUrl = `${this.config.frontendBaseUrl}/children`;
        const subject = `Children created (bulk) — ${params.town}`;

        const sample = params.sampleNames.length
            ? `\nSample:\n- ${params.sampleNames.join('\n- ')}`
            : '';
        const message =
            `Bulk child creation completed.\n\n` +
            `Town: ${params.town}\n` +
            `Created: ${params.totalCreated}\n` +
            sample +
            `\n\nOpen list: ${listUrl}`;

        for (const r of fallback) {
            const to = r.email;
            if (!to) continue;
            await this.notificationService.send({
                userId: r.id,
                to,
                subject,
                message,
                templateName: 'children-bulk-created',
                templateData: {
                    subject,
                    town: params.town,
                    totalCreated: params.totalCreated,
                    sampleNames: params.sampleNames,
                    listUrl,
                },
                actions: [{ id: 'OPEN_CHILDREN', label: 'Open children', redirectUrl: listUrl }],
                contextType: NotificationContextType.Child,
                contextId: `children_bulk_created:${params.town}:${Date.now()}`,
            });
        }
    }
}
