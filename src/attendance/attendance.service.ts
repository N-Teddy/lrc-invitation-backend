import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Activity, ActivityDocument } from '../schema/activity.schema';
import { Attendance, AttendanceDocument } from '../schema/attendance.schema';
import { User, UserDocument } from '../schema/user.schema';
import { ChildProfile, ChildProfileDocument } from '../schema/child-profile.schema';
import { UpsertAttendanceDto } from '../dtos/request/attendance.dto';
import { AttendanceRoleAtTime, ClassificationLabel } from '../common/enums/attendance.enum';
import { ActivityType, ChildGroup, TargetingCode, Town } from '../common/enums/activity.enum';
import { LifecycleStatus, MonitorLevel, UserRole } from '../common/enums/user.enum';
import { AgeBand } from '../common/constants/groups.constants';
import { computeAgeYears, startOfDayKey } from '../common/utils/groups.util';
import { computeGroupFromAge } from '../common/utils/age-group.util';
import { isEligibleChildForActivity } from '../common/utils/attendance-eligibility.util';
import { ReportingService } from '../reporting/reporting.service';
import { TownScopeService } from '../common/services/town-scope.service';
import { SettingsService } from '../settings/settings.service';
import { MonitorProfile, MonitorProfileDocument } from '../schema/monitor-profile.schema';
import {
    AttendanceEligibleChildrenResponseDto,
    AttendanceRosterResponseDto,
} from '../dtos/response/attendance-roster.dto';

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
        @InjectModel(MonitorProfile.name)
        private readonly monitorProfileModel: Model<MonitorProfileDocument>,
        private readonly reportingService: ReportingService,
        private readonly townScopeService: TownScopeService,
        private readonly settingsService: SettingsService,
    ) {}

    async getByActivityId(activityId: string, currentUser: Record<string, any>, scopeTown?: Town) {
        const activity = await this.activityModel.findById(activityId).lean().exec();
        if (!activity) throw new NotFoundException('Activity not found');
        await this.assertCanAccessAttendance(activity, currentUser);

        const resolvedScopeTown = await this.resolveScopeTown(activity, currentUser, scopeTown);

        const doc = await this.attendanceModel
            .findOne({ activityId: new Types.ObjectId(activityId) })
            .lean()
            .exec();
        const out = doc ?? { activityId, entries: [], externalEntries: [] };

        if (activity.type === ActivityType.Conference && resolvedScopeTown) {
            return {
                ...out,
                entries: (out.entries ?? []).filter(
                    (e: any) => (e.originTownAtTime as Town | undefined) === resolvedScopeTown,
                ),
                externalEntries: (out.externalEntries ?? []).filter(
                    (x: any) => (x.scopeTown as Town | undefined) === resolvedScopeTown,
                ),
            };
        }

        return out;
    }

    async upsertForActivity(
        activityId: string,
        dto: UpsertAttendanceDto,
        currentUser: Record<string, any>,
        scopeTown?: Town,
    ) {
        const activity = await this.activityModel.findById(activityId).lean().exec();
        if (!activity) throw new NotFoundException('Activity not found');
        await this.assertCanAccessAttendance(activity, currentUser);

        const resolvedScopeTown = await this.resolveScopeTown(activity, currentUser, scopeTown);
        const now = new Date();

        const existing = await this.attendanceModel
            .findOne({ activityId: new Types.ObjectId(activityId) })
            .lean()
            .exec();

        this.assertNotLocked(activity, now, existing);

        const allowedLabels = (await this.settingsService.getClassificationLabels())
            .labels as ClassificationLabel[];

        const normalizeDonationFcfa = (value: unknown): number | undefined => {
            if (value === null || value === undefined) return undefined;
            const n = Number(value);
            if (!Number.isFinite(n) || !Number.isInteger(n) || n < 0) {
                throw new BadRequestException('Invalid donationFcfa');
            }
            return n > 0 ? n : undefined;
        };

        const uniqueEntries = new Map<string, { present: boolean; donationFcfa?: number }>();
        for (const entry of dto.entries ?? []) {
            if (!entry?.userId) continue;
            if (entry.present !== true) continue; // present-only: do not record absences
            uniqueEntries.set(entry.userId, {
                present: true,
                donationFcfa: normalizeDonationFcfa((entry as any).donationFcfa),
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

        const monitorUserIds = users
            .filter((u) => u.role === UserRole.Monitor)
            .map((u) => u._id as Types.ObjectId);
        const monitorProfiles = monitorUserIds.length
            ? await this.monitorProfileModel
                  .find({ userId: { $in: monitorUserIds } })
                  .select({ userId: 1, homeTown: 1 })
                  .lean()
                  .exec()
            : [];
        const monitorProfileById = new Map<string, Record<string, any>>();
        for (const p of monitorProfiles) monitorProfileById.set(String(p.userId), p);

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

            const userTownAtTime: Town | undefined =
                user.role === UserRole.Monitor
                    ? ((monitorProfileById.get(userId)?.homeTown as Town | undefined) ??
                      (user.originTown as Town | undefined))
                    : (user.originTown as Town | undefined);

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

                if (activity.type !== ActivityType.Conference) {
                    if (userTownAtTime && (activity.town as Town) !== userTownAtTime) {
                        throw new BadRequestException(
                            'Child origin town does not match this activity town',
                        );
                    }
                } else if (
                    resolvedScopeTown &&
                    userTownAtTime &&
                    userTownAtTime !== resolvedScopeTown
                ) {
                    throw new BadRequestException(
                        'Child origin town does not match this attendance scope',
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

            if (user.role === UserRole.Monitor) {
                if (!userTownAtTime) {
                    throw new BadRequestException('Monitor town not set');
                }
                if (activity.type !== ActivityType.Conference) {
                    if ((activity.town as Town) !== userTownAtTime) {
                        throw new BadRequestException(
                            'Monitor town does not match this activity town',
                        );
                    }
                } else if (resolvedScopeTown && userTownAtTime !== resolvedScopeTown) {
                    throw new BadRequestException(
                        'Monitor town does not match this attendance scope',
                    );
                }
            }

            const classificationLabel =
                roleAtTime === AttendanceRoleAtTime.Monitor
                    ? ClassificationLabel.Monitor
                    : this.classificationForChildGroup(groupAtTime);

            entries.push({
                userId: new Types.ObjectId(userId),
                present: true,
                donationFcfa: input.donationFcfa,
                roleAtTime,
                originTownAtTime: userTownAtTime,
                groupAtTime,
                classificationLabel,
            });
        }

        const externalInput = dto.externalEntries ?? [];
        const externalById = new Map<
            string,
            { fullName: string; classificationLabel: ClassificationLabel; donationFcfa?: number }
        >();
        for (const x of externalInput) {
            if (!x) continue;
            const label = x.classificationLabel as ClassificationLabel;
            if (!allowedLabels.includes(label)) {
                throw new BadRequestException('Invalid classificationLabel');
            }
            const externalId = String(x.externalId ?? '').trim();
            const fullName = String(x.fullName ?? '').trim();
            if (!externalId) continue;
            if (!fullName || fullName.length < 2) continue;
            externalById.set(externalId, {
                fullName,
                classificationLabel: label,
                donationFcfa: normalizeDonationFcfa((x as any).donationFcfa),
            });
        }

        const externalEntries = [...externalById.entries()].map(([externalId, value]) => ({
            externalId,
            fullName: value.fullName,
            classificationLabel: value.classificationLabel,
            donationFcfa: value.donationFcfa,
            ...(activity.type === ActivityType.Conference && resolvedScopeTown
                ? { scopeTown: resolvedScopeTown }
                : {}),
        }));

        const takenByUserId = currentUser?._id ?? currentUser?.id;
        const takenAt = now;

        const existingEntries = existing?.entries ?? [];
        const nextEntries =
            activity.type === ActivityType.Conference && resolvedScopeTown
                ? [
                      ...existingEntries.filter(
                          (e: any) =>
                              (e.originTownAtTime as Town | undefined) !== resolvedScopeTown,
                      ),
                      ...entries,
                  ]
                : entries;

        const existingExternalEntries = (existing as any)?.externalEntries ?? [];
        const nextExternalEntries =
            activity.type === ActivityType.Conference && resolvedScopeTown
                ? [
                      ...existingExternalEntries.filter(
                          (x: any) => (x.scopeTown as Town | undefined) !== resolvedScopeTown,
                      ),
                      ...externalEntries,
                  ]
                : externalEntries;

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
                        entries: nextEntries,
                        externalEntries: nextExternalEntries,
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

        if (activity.type === ActivityType.Conference && resolvedScopeTown) {
            return {
                ...updated,
                entries: (updated.entries ?? []).filter(
                    (e: any) => (e.originTownAtTime as Town | undefined) === resolvedScopeTown,
                ),
                externalEntries: ((updated as any).externalEntries ?? []).filter(
                    (x: any) => (x.scopeTown as Town | undefined) === resolvedScopeTown,
                ),
            };
        }

        return updated;
    }

    async getRoster(
        activityId: string,
        currentUser: Record<string, any>,
        scopeTown?: Town,
    ): Promise<AttendanceRosterResponseDto> {
        const activity = await this.activityModel.findById(activityId).lean().exec();
        if (!activity) throw new NotFoundException('Activity not found');
        await this.assertCanAccessAttendance(activity, currentUser);

        const resolvedScopeTown = await this.resolveScopeTown(activity, currentUser, scopeTown);

        const allowedLabels = (await this.settingsService.getClassificationLabels())
            .labels as ClassificationLabel[];

        const attendance = await this.attendanceModel
            .findOne({ activityId: new Types.ObjectId(activityId) })
            .lean()
            .exec();

        const relevantAttendanceEntries =
            activity.type === ActivityType.Conference && resolvedScopeTown
                ? (attendance?.entries ?? []).filter(
                      (e: any) => (e.originTownAtTime as Town | undefined) === resolvedScopeTown,
                  )
                : (attendance?.entries ?? []);

        const presentUserIds = new Set(
            relevantAttendanceEntries
                .filter((e: any) => e.present === true)
                .map((e: any) => String(e.userId)),
        );

        const donationByUserId = new Map<string, number>();
        for (const e of relevantAttendanceEntries) {
            if (e?.present !== true) continue;
            const amount = Number((e as any).donationFcfa);
            if (!Number.isFinite(amount) || amount <= 0) continue;
            donationByUserId.set(String(e.userId), Math.floor(amount));
        }

        const relevantExternalEntries =
            activity.type === ActivityType.Conference && resolvedScopeTown
                ? ((attendance as any)?.externalEntries ?? []).filter(
                      (x: any) => (x.scopeTown as Town | undefined) === resolvedScopeTown,
                  )
                : ((attendance as any)?.externalEntries ?? []);

        const donationByExternalId = new Map<string, number>();
        for (const x of relevantExternalEntries ?? []) {
            const amount = Number((x as any).donationFcfa);
            if (!Number.isFinite(amount) || amount <= 0) continue;
            donationByExternalId.set(String(x.externalId), Math.floor(amount));
        }

        const mapping = await this.getAgeToGroupMapping();
        const asOf = activity.startDate ? new Date(activity.startDate) : new Date();

        const rosterTown: Town = (
            activity.type === ActivityType.Conference ? resolvedScopeTown : (activity.town as Town)
        ) as Town;

        const invitedChildIds = new Set(
            (activity.invitedChildrenUserIds ?? []).map((x: any) => String(x)).filter(Boolean),
        );

        const attendanceChildIds = new Set(
            relevantAttendanceEntries
                .filter((e: any) => e.roleAtTime === AttendanceRoleAtTime.Child)
                .map((e: any) => String(e.userId)),
        );

        const childIds = [...new Set([...invitedChildIds, ...attendanceChildIds])];
        const childUsers = childIds.length
            ? await this.userModel
                  .find({
                      _id: { $in: childIds.map((id) => new Types.ObjectId(id)) },
                      role: UserRole.Child,
                  })
                  .select({
                      _id: 1,
                      fullName: 1,
                      dateOfBirth: 1,
                      originTown: 1,
                      profileImage: 1,
                      lifecycleStatus: 1,
                  })
                  .lean()
                  .exec()
            : [];

        const childProfiles = childUsers.length
            ? await this.childProfileModel
                  .find({ userId: { $in: childUsers.map((u: any) => u._id) } })
                  .select({ userId: 1, currentGroup: 1, adultOverrideAllowed: 1 })
                  .lean()
                  .exec()
            : [];
        const childProfileById = new Map<string, Record<string, any>>();
        for (const p of childProfiles) childProfileById.set(String(p.userId), p);

        const children = childUsers
            .filter((u: any) => {
                if (activity.type === ActivityType.Conference) {
                    return (u.originTown as Town | undefined) === rosterTown;
                }
                return (u.originTown as Town | undefined) === (activity.town as Town);
            })
            .filter((u: any) => {
                if (u.lifecycleStatus !== LifecycleStatus.Archived) return true;
                return !!childProfileById.get(String(u._id))?.adultOverrideAllowed;
            })
            .map((u: any) => {
                const profile = childProfileById.get(String(u._id));
                const group: ChildGroup | undefined =
                    (profile?.currentGroup as ChildGroup | undefined) ??
                    (u.dateOfBirth
                        ? computeGroupFromAge(
                              computeAgeYears(new Date(u.dateOfBirth), asOf),
                              mapping.bands,
                          )
                        : undefined);

                return {
                    userId: String(u._id),
                    fullName: u.fullName as string,
                    role: AttendanceRoleAtTime.Child,
                    group,
                    profileImageUrl: (u?.profileImage?.url as string | undefined) ?? undefined,
                    present: presentUserIds.has(String(u._id)),
                    donationFcfa: donationByUserId.get(String(u._id)),
                    classificationLabel: this.classificationForChildGroup(group),
                };
            })
            .sort((a, b) => a.fullName.localeCompare(b.fullName));

        const monitors = await this.listMonitorsForTown(rosterTown);
        const monitorRoster = monitors
            .map((u: any) => {
                return {
                    userId: String(u._id),
                    fullName: u.fullName as string,
                    role: AttendanceRoleAtTime.Monitor,
                    profileImageUrl: (u?.profileImage?.url as string | undefined) ?? undefined,
                    present: presentUserIds.has(String(u._id)),
                    donationFcfa: donationByUserId.get(String(u._id)),
                    classificationLabel: ClassificationLabel.Monitor,
                };
            })
            .sort((a: any, b: any) => a.fullName.localeCompare(b.fullName));

        const now = new Date();
        const lockReason = this.getLockReason(activity, now, attendance);
        const locked = !!lockReason;

        const externalParticipants = (relevantExternalEntries ?? []).map((x: any) => ({
            userId: `external:${String(x.externalId)}`,
            fullName: String(x.fullName),
            role: 'external',
            classificationLabel: x.classificationLabel as ClassificationLabel,
            present: true,
            donationFcfa: donationByExternalId.get(String(x.externalId)),
        }));

        return {
            activityId,
            activityType: activity.type as ActivityType,
            activityTown: activity.town as Town,
            targetingCode: activity.targetingCode as TargetingCode,
            startDate: new Date(activity.startDate),
            endDate: new Date(activity.endDate),
            scopeTown: activity.type === ActivityType.Conference ? resolvedScopeTown : undefined,
            takenAt: attendance?.takenAt ? new Date(attendance.takenAt) : undefined,
            locked,
            lockReason,
            classificationLabels: allowedLabels,
            participants: [...children, ...monitorRoster, ...externalParticipants].sort((a, b) =>
                a.fullName.localeCompare(b.fullName),
            ),
            externalEntries: (relevantExternalEntries ?? []).map((x: any) => ({
                externalId: String(x.externalId),
                fullName: String(x.fullName),
                classificationLabel: x.classificationLabel as ClassificationLabel,
                donationFcfa: donationByExternalId.get(String(x.externalId)),
            })),
        };
    }

    async searchEligibleChildren(
        activityId: string,
        query: string,
        limit: number,
        currentUser: Record<string, any>,
        scopeTown?: Town,
    ): Promise<AttendanceEligibleChildrenResponseDto> {
        const activity = await this.activityModel.findById(activityId).lean().exec();
        if (!activity) throw new NotFoundException('Activity not found');
        await this.assertCanAccessAttendance(activity, currentUser);

        const resolvedScopeTown = await this.resolveScopeTown(activity, currentUser, scopeTown);
        const rosterTown: Town = (
            activity.type === ActivityType.Conference ? resolvedScopeTown : (activity.town as Town)
        ) as Town;

        const q = (query ?? '').trim();
        if (q.length < 2) {
            return { activityId, query: q, scopeTown: resolvedScopeTown, results: [] };
        }

        const max = Number.isFinite(limit) ? Math.max(1, Math.min(30, Math.floor(limit))) : 15;

        const mapping = await this.getAgeToGroupMapping();
        const asOf = activity.startDate ? new Date(activity.startDate) : new Date();
        const allowUnknownGroup = (activity.targetingCode as TargetingCode) === TargetingCode.ABCD;

        const filter: Record<string, any> = {
            role: UserRole.Child,
            originTown: rosterTown,
            fullName: { $regex: q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' },
            lifecycleStatus: { $in: [LifecycleStatus.Active, LifecycleStatus.Archived] },
        };

        const candidates = await this.userModel
            .find(filter)
            .select({ _id: 1, fullName: 1, dateOfBirth: 1, profileImage: 1, lifecycleStatus: 1 })
            .limit(max * 3)
            .lean()
            .exec();

        if (!candidates.length) {
            return { activityId, query: q, scopeTown: resolvedScopeTown, results: [] };
        }

        const candidateIds = candidates.map((c: any) => c._id);
        const profiles = await this.childProfileModel
            .find({ userId: { $in: candidateIds } })
            .select({ userId: 1, currentGroup: 1, adultOverrideAllowed: 1 })
            .lean()
            .exec();
        const profileByUserId = new Map<string, Record<string, any>>();
        for (const p of profiles) profileByUserId.set(String(p.userId), p);

        const results: Array<{
            userId: string;
            fullName: string;
            group?: ChildGroup;
            profileImageUrl?: string;
        }> = [];

        for (const c of candidates) {
            const profile = profileByUserId.get(String(c._id));
            if (c.lifecycleStatus === LifecycleStatus.Archived && !profile?.adultOverrideAllowed) {
                continue;
            }

            const group: ChildGroup | undefined =
                (profile?.currentGroup as ChildGroup | undefined) ??
                (c.dateOfBirth
                    ? computeGroupFromAge(
                          computeAgeYears(new Date(c.dateOfBirth), asOf),
                          mapping.bands,
                      )
                    : undefined);

            if (!group && !allowUnknownGroup) continue;
            if (group) {
                const ok = isEligibleChildForActivity(
                    activity.targetingCode as TargetingCode,
                    group,
                );
                if (!ok) continue;
            }

            results.push({
                userId: String(c._id),
                fullName: c.fullName as string,
                group,
                profileImageUrl: (c as any)?.profileImage?.url as string | undefined,
            });

            if (results.length >= max) break;
        }

        return { activityId, query: q, scopeTown: resolvedScopeTown, results };
    }

    private async assertCanAccessAttendance(
        activity: Record<string, any>,
        currentUser: Record<string, any>,
    ) {
        if (currentUser?.role !== UserRole.Monitor) {
            throw new ForbiddenException('Only monitors can access attendance');
        }
        if (currentUser?.monitorLevel === MonitorLevel.Super) return;
        if (activity.type === ActivityType.Conference) return;

        const userTown = await this.townScopeService.resolveMonitorTown(currentUser);
        if (!userTown) throw new ForbiddenException('Monitor town not set');
        if ((activity.town as Town | undefined) !== userTown) {
            throw new ForbiddenException(
                'Monitors can only take attendance for their town activities',
            );
        }
    }

    private async getAgeToGroupMapping(): Promise<{ bands: AgeBand[] }> {
        return this.settingsService.getAgeToGroupMapping();
    }

    private async resolveScopeTown(
        activity: Record<string, any>,
        currentUser: Record<string, any>,
        requested?: Town,
    ): Promise<Town | undefined> {
        if (activity.type !== ActivityType.Conference) return undefined;

        const userTown = await this.townScopeService.resolveMonitorTown(currentUser);
        if (!userTown) throw new ForbiddenException('Monitor town not set');

        if (currentUser?.monitorLevel === MonitorLevel.Super && requested) {
            return requested;
        }
        return userTown;
    }

    private getLockReason(
        activity: Record<string, any>,
        now: Date,
        attendance?: { takenAt?: Date },
    ): string | undefined {
        const start = new Date(activity.startDate);
        const end = new Date(activity.endDate);

        const nowKey = startOfDayKey(now);
        const startKey = startOfDayKey(start);
        const endKey = startOfDayKey(end);

        if (nowKey < startKey) {
            return 'Attendance can only be taken on the day(s) of the activity';
        }
        if (nowKey > endKey && attendance?.takenAt) {
            return 'Attendance is locked after activity ends';
        }
        if (now > end && attendance?.takenAt) {
            return 'Attendance is locked after activity ends';
        }
        return undefined;
    }

    private assertNotLocked(
        activity: Record<string, any>,
        now: Date,
        attendance?: { takenAt?: Date },
    ) {
        const reason = this.getLockReason(activity, now, attendance);
        if (!reason) return;
        throw new ForbiddenException(reason);
    }

    private async listMonitorsForTown(town: Town) {
        const profileMatches = await this.monitorProfileModel
            .find({ homeTown: town })
            .select({ userId: 1 })
            .lean()
            .exec();
        const idsFromProfiles = profileMatches.map((p) => p.userId);

        const fallback = await this.userModel
            .find({ role: UserRole.Monitor, originTown: town })
            .select({ _id: 1 })
            .lean()
            .exec();
        const idsFromUsers = fallback.map((u) => u._id);

        const ids = [...new Set([...idsFromProfiles, ...idsFromUsers].map((x) => String(x)))].map(
            (id) => new Types.ObjectId(id),
        );

        if (!ids.length) return [];

        return this.userModel
            .find({
                _id: { $in: ids },
                role: UserRole.Monitor,
                lifecycleStatus: LifecycleStatus.Active,
                registrationPendingApproval: false,
            })
            .select({ _id: 1, fullName: 1, profileImage: 1 })
            .lean()
            .exec();
    }

    private classificationForChildGroup(
        group: ChildGroup | undefined,
    ): ClassificationLabel | undefined {
        if (!group) return undefined;
        if (group === 'Pre A') return ClassificationLabel.PreA;
        if (group === 'A') return ClassificationLabel.A;
        if (group === 'B') return ClassificationLabel.B;
        if (group === 'C') return ClassificationLabel.C;
        if (group === 'D') return ClassificationLabel.D;
        return undefined;
    }
}
