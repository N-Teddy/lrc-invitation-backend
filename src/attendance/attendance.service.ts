import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Activity, ActivityDocument } from '../schema/activity.schema';
import { Attendance, AttendanceDocument } from '../schema/attendance.schema';
import { User, UserDocument } from '../schema/user.schema';
import { ChildProfile, ChildProfileDocument } from '../schema/child-profile.schema';
import { Settings, SettingsDocument } from '../schema/settings.schema';
import { UpsertAttendanceDto } from '../dtos/request/attendance.dto';
import { AttendanceRoleAtTime } from '../common/enums/attendance.enum';
import { ChildGroup, TargetingCode } from '../common/enums/activity.enum';
import { UserRole, LifecycleStatus } from '../common/enums/user.enum';
import { DEFAULT_AGE_TO_GROUP_MAPPING, AgeBand } from '../common/constants/groups.constants';
import { computeAgeYears } from '../common/utils/groups.util';
import { computeGroupFromAge } from '../common/utils/age-group.util';
import { isEligibleChildForActivity } from '../common/utils/attendance-eligibility.util';
import { ReportingService } from '../reporting/reporting.service';

@Injectable()
export class AttendanceService {
    constructor(
        @InjectModel(Attendance.name)
        private readonly attendanceModel: Model<AttendanceDocument>,
        @InjectModel(Activity.name)
        private readonly activityModel: Model<ActivityDocument>,
        @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
        @InjectModel(ChildProfile.name)
        private readonly childProfileModel: Model<ChildProfileDocument>,
        @InjectModel(Settings.name) private readonly settingsModel: Model<SettingsDocument>,
        private readonly reportingService: ReportingService,
    ) {}

    async getByActivityId(activityId: string) {
        await this.assertActivityExists(activityId);
        const doc = await this.attendanceModel
            .findOne({ activityId: new Types.ObjectId(activityId) })
            .lean()
            .exec();
        return doc ?? { activityId, entries: [] };
    }

    async upsertForActivity(
        activityId: string,
        dto: UpsertAttendanceDto,
        currentUser: Record<string, any>,
    ) {
        const activity = await this.activityModel.findById(activityId).lean().exec();
        if (!activity) throw new NotFoundException('Activity not found');

        const uniqueEntries = new Map<string, { present: boolean; classificationLabel?: any }>();
        for (const entry of dto.entries ?? []) {
            uniqueEntries.set(entry.userId, {
                present: entry.present,
                classificationLabel: entry.classificationLabel,
            });
        }

        const userIds = [...uniqueEntries.keys()];
        const users = await this.userModel
            .find({ _id: { $in: userIds.map((id) => new Types.ObjectId(id)) } })
            .lean()
            .exec();

        if (users.length !== userIds.length) {
            throw new BadRequestException('One or more users not found');
        }

        const userById = new Map<string, Record<string, any>>();
        for (const u of users) userById.set(String(u._id), u);

        const childUserIds = users
            .filter((u) => u.role === UserRole.Child)
            .map((u) => u._id as Types.ObjectId);
        const childProfiles = childUserIds.length
            ? await this.childProfileModel
                  .find({ userId: { $in: childUserIds } })
                  .lean()
                  .exec()
            : [];
        const childProfileById = new Map<string, Record<string, any>>();
        for (const p of childProfiles) childProfileById.set(String(p.userId), p);

        const mapping = await this.getAgeToGroupMapping();
        const asOf = activity.startDate ? new Date(activity.startDate) : new Date();

        const entries: any[] = [];
        for (const userId of userIds) {
            const user = userById.get(userId);
            const input = uniqueEntries.get(userId);
            if (!user || !input) continue;

            if (user.role !== UserRole.Child && user.role !== UserRole.Monitor) {
                throw new BadRequestException('Invalid user role for attendance');
            }

            const roleAtTime =
                user.role === UserRole.Child
                    ? AttendanceRoleAtTime.Child
                    : AttendanceRoleAtTime.Monitor;

            let groupAtTime: ChildGroup | undefined;
            if (user.role === UserRole.Child) {
                const profile = childProfileById.get(userId);

                if (
                    user.lifecycleStatus === LifecycleStatus.Archived &&
                    !profile?.adultOverrideAllowed
                ) {
                    throw new BadRequestException(
                        'Archived adult is not eligible unless allowed by leadership',
                    );
                }

                if (user.lifecycleStatus !== LifecycleStatus.Archived) {
                    groupAtTime =
                        (profile?.currentGroup as ChildGroup | undefined) ??
                        (user.dateOfBirth
                            ? computeGroupFromAge(
                                  computeAgeYears(new Date(user.dateOfBirth), asOf),
                                  mapping.bands,
                              )
                            : undefined);
                } else {
                    groupAtTime = undefined;
                }

                if (groupAtTime) {
                    const ok = isEligibleChildForActivity(
                        activity.targetingCode as TargetingCode,
                        groupAtTime,
                    );
                    if (!ok) {
                        throw new BadRequestException(
                            'Child group is not eligible for this activity',
                        );
                    }
                }
            }

            entries.push({
                userId: new Types.ObjectId(userId),
                present: input.present,
                roleAtTime,
                originTownAtTime: user.originTown,
                groupAtTime,
                classificationLabel: input.classificationLabel,
            });
        }

        const takenByUserId = currentUser?._id ?? currentUser?.id;
        const takenAt = new Date();

        const updated = await this.attendanceModel
            .findOneAndUpdate(
                { activityId: new Types.ObjectId(activityId) },
                {
                    $set: {
                        activityId: new Types.ObjectId(activityId),
                        takenByUserId: takenByUserId
                            ? new Types.ObjectId(String(takenByUserId))
                            : undefined,
                        takenAt,
                        entries,
                    },
                },
                { upsert: true, new: true },
            )
            .lean()
            .exec();

        if (!updated) {
            throw new NotFoundException('Attendance not found');
        }

        try {
            await this.reportingService.notifySuperMonitorsAfterAttendance(activityId);
        } catch {
            // Non-blocking: attendance save must succeed even if notification delivery fails.
        }

        return updated;
    }

    private async assertActivityExists(activityId: string) {
        const exists = await this.activityModel.exists({ _id: new Types.ObjectId(activityId) });
        if (!exists) throw new NotFoundException('Activity not found');
    }

    private async getAgeToGroupMapping(): Promise<{ bands: AgeBand[] }> {
        const existing = await this.settingsModel
            .findOne({ key: 'ageToGroupMapping' })
            .lean()
            .exec();
        if (existing?.value?.bands?.length) {
            return { bands: existing.value.bands as AgeBand[] };
        }
        return { bands: DEFAULT_AGE_TO_GROUP_MAPPING };
    }
}
