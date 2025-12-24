import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
    CreateActivityDto,
    UpdateActivityDto,
    UpdateActivityInvitationsDto,
} from '../dtos/request/activity.dto';
import { ActivityType, ChildGroup, TargetingCode, Town } from '../common/enums/activity.enum';
import { LifecycleStatus, MonitorLevel, UserRole } from '../common/enums/user.enum';
import { Activity, ActivityDocument } from '../schema/activity.schema';
import { User, UserDocument } from '../schema/user.schema';
import { ChildProfile, ChildProfileDocument } from '../schema/child-profile.schema';
import { Attendance, AttendanceDocument } from '../schema/attendance.schema';
import { AttendanceRoleAtTime } from '../common/enums/attendance.enum';
import { AgeBand } from '../common/constants/groups.constants';
import { computeAgeYears } from '../common/utils/groups.util';
import { computeGroupFromAge } from '../common/utils/age-group.util';
import { subtractMonths } from '../common/utils/date.util';
import {
    isValidConferenceDuration,
    targetGroupsForTargetingCode,
} from '../common/utils/activity-targeting.util';
import { TownScopeService } from '../common/services/town-scope.service';
import { SettingsService } from '../settings/settings.service';

@Injectable()
export class ActivitiesService {
    constructor(
        @InjectModel(Activity.name) private readonly activityModel: Model<ActivityDocument>,
        @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
        @InjectModel(ChildProfile.name)
        private readonly childProfileModel: Model<ChildProfileDocument>,
        @InjectModel(Attendance.name)
        private readonly attendanceModel: Model<AttendanceDocument>,
        private readonly townScopeService: TownScopeService,
        private readonly settingsService: SettingsService,
    ) {}

    async create(dto: CreateActivityDto, currentUser: Record<string, any>) {
        const userTown = await this.townScopeService.resolveMonitorTown(currentUser);
        await this.assertCanCreate(dto, currentUser, userTown);
        const activityPayload = this.normalizeCreatePayload(dto, currentUser, userTown);

        const { invitedChildrenUserIds, invitedMonitorUserIds } =
            await this.computeInvitations(activityPayload);

        const created = await new this.activityModel({
            ...activityPayload,
            invitedChildrenUserIds,
            invitedMonitorUserIds,
        }).save();
        return created.toObject();
    }

    async findAll(
        filters: { town?: Town; type?: ActivityType; from?: string; to?: string },
        currentUser?: Record<string, any>,
    ) {
        const baseQuery: Record<string, any> = {};
        if (filters.town) baseQuery.town = filters.town;
        if (filters.type) baseQuery.type = filters.type;
        if (filters.from || filters.to) {
            baseQuery.startDate = {};
            if (filters.from) baseQuery.startDate.$gte = new Date(filters.from);
            if (filters.to) baseQuery.startDate.$lte = new Date(filters.to);
        }

        if (
            filters.type === ActivityType.Conference &&
            filters.town &&
            filters.town !== Town.Yaounde
        ) {
            throw new BadRequestException('Conference town is always Yaoundé');
        }

        if (currentUser && currentUser.monitorLevel !== MonitorLevel.Super) {
            const userTown = await this.townScopeService.resolveMonitorTown(currentUser);
            if (!userTown) {
                throw new ForbiddenException('Monitor town not set');
            }

            if (filters.type && filters.type === ActivityType.Conference) {
                // Conferences are global.
            } else if (filters.town && filters.town !== userTown) {
                throw new ForbiddenException('Not allowed to view other towns');
            }

            const scopeQuery = {
                $or: [
                    { type: ActivityType.Conference },
                    { town: userTown, type: { $ne: ActivityType.Conference } },
                ],
            };

            return this.activityModel
                .find({ $and: [baseQuery, scopeQuery] })
                .sort({ startDate: -1 })
                .lean()
                .exec();
        }

        return this.activityModel.find(baseQuery).sort({ startDate: -1 }).lean().exec();
    }

    async findOneOrFail(id: string, currentUser?: Record<string, any>) {
        const activity = await this.activityModel.findById(id).lean().exec();
        if (!activity) throw new NotFoundException('Activity not found');
        if (currentUser) {
            await this.assertCanRead(activity, currentUser);
        }
        return activity;
    }

    async update(id: string, dto: UpdateActivityDto, currentUser: Record<string, any>) {
        const existing = await this.findOneOrFail(id);
        const userTown = await this.townScopeService.resolveMonitorTown(currentUser);
        await this.assertCanEdit(existing, currentUser, userTown);

        const payload = this.normalizeUpdatePayload(existing, dto, currentUser);
        const updated = await this.activityModel
            .findByIdAndUpdate(id, { $set: payload }, { new: true })
            .lean()
            .exec();
        if (!updated) throw new NotFoundException('Activity not found');
        return updated;
    }

    async remove(id: string, currentUser: Record<string, any>) {
        const existing = await this.findOneOrFail(id);
        const userTown = await this.townScopeService.resolveMonitorTown(currentUser);
        await this.assertCanEdit(existing, currentUser, userTown);
        await this.activityModel.findByIdAndDelete(id).exec();
        return { deleted: true };
    }

    async regenerateInvitations(id: string, currentUser: Record<string, any>) {
        const activity = await this.findOneOrFail(id);
        const userTown = await this.townScopeService.resolveMonitorTown(currentUser);
        await this.assertCanRegenerateInvitations(activity, currentUser, userTown);

        const { invitedChildrenUserIds, invitedMonitorUserIds } =
            await this.computeInvitations(activity);

        const updated = await this.activityModel
            .findByIdAndUpdate(
                id,
                { $set: { invitedChildrenUserIds, invitedMonitorUserIds } },
                { new: true },
            )
            .lean()
            .exec();
        if (!updated) throw new NotFoundException('Activity not found');
        return updated;
    }

    async overrideInvitations(
        id: string,
        dto: UpdateActivityInvitationsDto,
        currentUser: Record<string, any>,
    ) {
        const activity = await this.findOneOrFail(id);
        await this.assertCanRead(activity, currentUser);
        this.assertCanOverrideInvitations(activity, currentUser);

        const validated = await this.validateInvitationOverride(activity, dto);

        const update: Record<string, any> = {};
        if (validated.invitedChildrenUserIds) {
            update.invitedChildrenUserIds = validated.invitedChildrenUserIds.map(
                (x) => new Types.ObjectId(x),
            );
        }
        if (validated.invitedMonitorUserIds) {
            update.invitedMonitorUserIds = validated.invitedMonitorUserIds.map(
                (x) => new Types.ObjectId(x),
            );
        }

        const updated = await this.activityModel
            .findByIdAndUpdate(id, { $set: update }, { new: true })
            .lean()
            .exec();
        if (!updated) throw new NotFoundException('Activity not found');
        return updated;
    }

    async getInvitedChildrenDetails(activityId: string, currentUser: Record<string, any>) {
        const activity = await this.findOneOrFail(activityId, currentUser);
        const mapping = await this.getAgeToGroupMapping();
        const groups = targetGroupsForTargetingCode(activity.targetingCode as TargetingCode);
        const asOf = activity.startDate ? new Date(activity.startDate) : new Date();

        const invitedIds = (activity.invitedChildrenUserIds ?? []).map((x: any) =>
            typeof x === 'string' ? new Types.ObjectId(x) : (x as Types.ObjectId),
        );

        if (!invitedIds.length) {
            return {
                activityId,
                targetGroups: groups,
                invited: [],
            };
        }

        const users = await this.userModel
            .find({ _id: { $in: invitedIds }, role: UserRole.Child })
            .select({ _id: 1, fullName: 1, dateOfBirth: 1, profileImage: 1 })
            .lean()
            .exec();

        const profiles = await this.childProfileModel
            .find({ userId: { $in: invitedIds } })
            .select({ userId: 1, currentGroup: 1 })
            .lean()
            .exec();
        const profileByUserId = new Map<string, Record<string, any>>();
        for (const p of profiles) {
            profileByUserId.set(String(p.userId), p);
        }

        const cards = users
            .map((u) => {
                const profile = profileByUserId.get(String(u._id));
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
                    group,
                    profileImageUrl: (u as any)?.profileImage?.url as string | undefined,
                };
            })
            .sort((a, b) => a.fullName.localeCompare(b.fullName));

        return {
            activityId,
            targetGroups: groups,
            invited: cards,
        };
    }

    async searchEligibleChildrenForInvitations(
        activityId: string,
        query: string,
        limit: number,
        currentUser: Record<string, any>,
    ) {
        const activity = await this.findOneOrFail(activityId, currentUser);
        this.assertCanOverrideInvitations(activity, currentUser);

        const q = (query ?? '').trim();
        if (q.length < 2) {
            return {
                activityId,
                query: q,
                targetGroups: targetGroupsForTargetingCode(activity.targetingCode as TargetingCode),
                results: [],
            };
        }

        const max = Number.isFinite(limit) ? Math.max(1, Math.min(30, Math.floor(limit))) : 15;
        const mapping = await this.getAgeToGroupMapping();
        const groups = targetGroupsForTargetingCode(activity.targetingCode as TargetingCode);
        const asOf = activity.startDate ? new Date(activity.startDate) : new Date();
        const allowUnknownGroup = (activity.targetingCode as TargetingCode) === TargetingCode.ABCD;

        const alreadyInvited = new Set(
            (activity.invitedChildrenUserIds ?? []).map((x: any) => String(x)),
        );

        const filter: Record<string, any> = {
            role: UserRole.Child,
            lifecycleStatus: LifecycleStatus.Active,
            fullName: { $regex: q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' },
        };

        if (activity.type !== ActivityType.Conference) {
            filter.originTown = activity.town;
        }

        const candidates = await this.userModel
            .find(filter)
            .select({ _id: 1, fullName: 1, dateOfBirth: 1, profileImage: 1 })
            .limit(max * 3)
            .lean()
            .exec();

        if (!candidates.length) {
            return { activityId, query: q, targetGroups: groups, results: [] };
        }

        const candidateIds = candidates.map((c) => c._id);
        const profiles = await this.childProfileModel
            .find({ userId: { $in: candidateIds } })
            .select({ userId: 1, currentGroup: 1 })
            .lean()
            .exec();
        const profileByUserId = new Map<string, Record<string, any>>();
        for (const p of profiles) {
            profileByUserId.set(String(p.userId), p);
        }

        const results: Array<{
            userId: string;
            fullName: string;
            group?: ChildGroup;
            profileImageUrl?: string;
        }> = [];

        for (const c of candidates) {
            if (alreadyInvited.has(String(c._id))) continue;

            const profile = profileByUserId.get(String(c._id));
            const group: ChildGroup | undefined =
                (profile?.currentGroup as ChildGroup | undefined) ??
                (c.dateOfBirth
                    ? computeGroupFromAge(
                          computeAgeYears(new Date(c.dateOfBirth), asOf),
                          mapping.bands,
                      )
                    : undefined);

            if (!group && !allowUnknownGroup) continue;
            if (group && !groups.includes(group)) continue;

            results.push({
                userId: String(c._id),
                fullName: c.fullName as string,
                group,
                profileImageUrl: (c as any)?.profileImage?.url as string | undefined,
            });

            if (results.length >= max) break;
        }

        return { activityId, query: q, targetGroups: groups, results };
    }

    async getConferenceEligibility(activityId: string, currentUser: Record<string, any>) {
        const activity = await this.findOneOrFail(activityId, currentUser);
        if (activity.type !== ActivityType.Conference) {
            throw new BadRequestException('Eligibility highlight is only for conferences');
        }

        const conferenceStart = new Date(activity.startDate);
        const windowStart = subtractMonths(conferenceStart, 3);

        const invitedIds = (activity.invitedChildrenUserIds ?? []).map((x: any) =>
            typeof x === 'string' ? new Types.ObjectId(x) : (x as Types.ObjectId),
        );

        if (!invitedIds.length) {
            return {
                activityId,
                windowStart,
                windowEnd: conferenceStart,
                invitedCount: 0,
                qualifiedCount: 0,
                flaggedCount: 0,
                flaggedChildren: [],
            };
        }

        const candidateActivities = await this.activityModel
            .find({
                type: { $ne: ActivityType.Conference },
                startDate: { $gte: windowStart, $lt: conferenceStart },
            })
            .select({ _id: 1, targetingCode: 1, startDate: 1 })
            .lean()
            .exec();

        if (!candidateActivities.length) {
            return {
                activityId,
                windowStart,
                windowEnd: conferenceStart,
                invitedCount: invitedIds.length,
                qualifiedCount: 0,
                flaggedCount: invitedIds.length,
                flaggedChildren: invitedIds.map((idObj) => ({
                    userId: String(idObj),
                    reason: 'No qualifying activity attendance in last 3 months',
                })),
            };
        }

        const activityById = new Map<
            string,
            { targetingCode: TargetingCode; startDate: Date; targetGroups: ChildGroup[] }
        >();
        for (const a of candidateActivities) {
            const targetingCode = a.targetingCode as TargetingCode;
            activityById.set(String(a._id), {
                targetingCode,
                startDate: new Date(a.startDate),
                targetGroups: targetGroupsForTargetingCode(targetingCode),
            });
        }

        const attendanceDocs = await this.attendanceModel
            .find({
                activityId: { $in: candidateActivities.map((a) => a._id) },
                entries: {
                    $elemMatch: {
                        userId: { $in: invitedIds },
                        present: true,
                        roleAtTime: AttendanceRoleAtTime.Child,
                    },
                },
            })
            .lean()
            .exec();

        const invitedIdStrings = invitedIds.map((x) => String(x));
        const invitedSet = new Set(invitedIdStrings);
        const qualified = new Set<string>();

        const fallbackChecks: Array<{
            userId: string;
            activityStart: Date;
            targetGroups: ChildGroup[];
        }> = [];

        for (const doc of attendanceDocs) {
            const meta = activityById.get(String(doc.activityId));
            if (!meta) continue;

            for (const entry of doc.entries ?? []) {
                const userId = String((entry as any).userId);
                if (!invitedSet.has(userId)) continue;
                if (!(entry as any).present) continue;
                if ((entry as any).roleAtTime !== AttendanceRoleAtTime.Child) continue;
                if (qualified.has(userId)) continue;

                const group = (entry as any).groupAtTime as ChildGroup | undefined;
                if (!group) {
                    fallbackChecks.push({
                        userId,
                        activityStart: meta.startDate,
                        targetGroups: meta.targetGroups,
                    });
                    continue;
                }

                if (meta.targetGroups.includes(group)) {
                    qualified.add(userId);
                }
            }
        }

        if (fallbackChecks.length) {
            const mapping = await this.getAgeToGroupMapping();
            const uniqueUserIds = [...new Set(fallbackChecks.map((x) => x.userId))];

            const users = await this.userModel
                .find({ _id: { $in: uniqueUserIds.map((id) => new Types.ObjectId(id)) } })
                .select({ _id: 1, dateOfBirth: 1 })
                .lean()
                .exec();

            const dobById = new Map<string, Date | undefined>();
            for (const u of users) {
                dobById.set(String(u._id), u.dateOfBirth ? new Date(u.dateOfBirth) : undefined);
            }

            for (const item of fallbackChecks) {
                if (qualified.has(item.userId)) continue;
                const dob = dobById.get(item.userId);
                if (!dob) continue;
                const group = computeGroupFromAge(
                    computeAgeYears(dob, item.activityStart),
                    mapping.bands,
                );
                if (item.targetGroups.includes(group)) {
                    qualified.add(item.userId);
                }
            }
        }

        const flaggedChildren = invitedIdStrings
            .filter((id) => !qualified.has(id))
            .map((id) => ({
                userId: id,
                reason: 'No qualifying activity attendance in last 3 months',
            }));

        return {
            activityId,
            windowStart,
            windowEnd: conferenceStart,
            invitedCount: invitedIds.length,
            qualifiedCount: qualified.size,
            flaggedCount: flaggedChildren.length,
            flaggedChildren,
        };
    }

    private normalizeCreatePayload(
        dto: CreateActivityDto,
        currentUser: Record<string, any>,
        userTown?: Town,
    ) {
        const startDate = new Date(dto.startDate);
        const endDate = new Date(dto.endDate);
        if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
            throw new BadRequestException('Invalid startDate/endDate');
        }
        if (startDate.getTime() > endDate.getTime()) {
            throw new BadRequestException('startDate must be before endDate');
        }

        const type = dto.type;
        const town = type === ActivityType.Conference ? Town.Yaounde : userTown;

        if (type === ActivityType.Conference) {
            if (!isValidConferenceDuration(dto.conferenceDurationDays)) {
                throw new BadRequestException('Conference duration must be 2 or 5 days');
            }
        } else if (dto.conferenceDurationDays !== undefined) {
            throw new BadRequestException('conferenceDurationDays is only allowed for conferences');
        }

        if (!town) {
            throw new ForbiddenException('Monitor town not set');
        }

        return {
            type,
            town,
            startDate,
            endDate,
            conferenceDurationDays: dto.conferenceDurationDays,
            targetingCode: dto.targetingCode,
            notes: dto.notes,
            createdByUserId: currentUser?._id ?? currentUser?.id,
        };
    }

    private normalizeUpdatePayload(
        existing: Record<string, any>,
        dto: UpdateActivityDto,
        currentUser: Record<string, any>,
    ) {
        const merged: any = {
            ...existing,
            ...dto,
        };

        if (dto.town !== undefined) {
            throw new BadRequestException(
                'town cannot be edited; it is derived from the activity scope',
            );
        }

        // Conferences always remain in Yaoundé.
        if (merged.type === ActivityType.Conference) {
            merged.town = Town.Yaounde;
            if (!isValidConferenceDuration(merged.conferenceDurationDays)) {
                throw new BadRequestException('Conference duration must be 2 or 5 days');
            }
        } else if (merged.conferenceDurationDays !== undefined) {
            throw new BadRequestException('conferenceDurationDays is only allowed for conferences');
        }

        if (dto.startDate) merged.startDate = new Date(dto.startDate);
        if (dto.endDate) merged.endDate = new Date(dto.endDate);
        if (
            merged.startDate &&
            merged.endDate &&
            merged.startDate.getTime() > merged.endDate.getTime()
        ) {
            throw new BadRequestException('startDate must be before endDate');
        }

        // Prevent non-super monitors from converting an activity into a conference.
        if (
            merged.type === ActivityType.Conference &&
            currentUser?.monitorLevel !== MonitorLevel.Super
        ) {
            throw new ForbiddenException('Only Super Monitors can manage conferences');
        }

        const payload: any = {};
        if (dto.type !== undefined) payload.type = merged.type;
        if (dto.town !== undefined) payload.town = merged.town;
        if (dto.startDate !== undefined) payload.startDate = merged.startDate;
        if (dto.endDate !== undefined) payload.endDate = merged.endDate;
        if (dto.conferenceDurationDays !== undefined)
            payload.conferenceDurationDays = merged.conferenceDurationDays;
        if (dto.targetingCode !== undefined) payload.targetingCode = merged.targetingCode;
        if (dto.notes !== undefined) payload.notes = merged.notes;
        return payload;
    }

    private async assertCanCreate(
        dto: CreateActivityDto,
        currentUser: Record<string, any>,
        userTown?: Town,
    ) {
        if (currentUser?.role !== UserRole.Monitor) {
            throw new ForbiddenException('Only monitors can create activities');
        }
        if (currentUser?.monitorLevel === MonitorLevel.Aspiring) {
            throw new ForbiddenException('Aspiring monitors cannot create activities');
        }
        if (
            dto.type === ActivityType.Conference &&
            currentUser?.monitorLevel !== MonitorLevel.Super
        ) {
            throw new ForbiddenException('Only Super Monitors can create conferences');
        }
        if (!userTown) throw new ForbiddenException('Monitor town not set');
    }

    private async assertCanEdit(
        activity: Record<string, any>,
        currentUser: Record<string, any>,
        userTown?: Town,
    ) {
        if (currentUser?.role !== UserRole.Monitor) {
            throw new ForbiddenException('Only monitors can manage activities');
        }
        if (currentUser?.monitorLevel === MonitorLevel.Aspiring) {
            throw new ForbiddenException('Aspiring monitors cannot manage activities');
        }
        if (
            activity.type === ActivityType.Conference &&
            currentUser?.monitorLevel !== MonitorLevel.Super
        ) {
            throw new ForbiddenException('Only Super Monitors can manage conferences');
        }
        if (currentUser?.monitorLevel !== MonitorLevel.Super) {
            const resolvedTown =
                userTown ?? (await this.townScopeService.resolveMonitorTown(currentUser));
            if (!resolvedTown) throw new ForbiddenException('Monitor town not set');
            if (activity.town !== resolvedTown) {
                throw new ForbiddenException('Monitors can only manage activities for their town');
            }
        }
    }

    private async assertCanRead(activity: Record<string, any>, currentUser: Record<string, any>) {
        if (currentUser?.role !== UserRole.Monitor) {
            throw new ForbiddenException('Only monitors can view activities');
        }
        if (currentUser?.monitorLevel === MonitorLevel.Super) return;
        if (activity.type === ActivityType.Conference) return;

        const userTown = await this.townScopeService.resolveMonitorTown(currentUser);
        if (!userTown) throw new ForbiddenException('Monitor town not set');
        if (activity.town !== userTown) {
            throw new ForbiddenException('Not allowed to view other towns');
        }
    }

    private async assertCanRegenerateInvitations(
        activity: Record<string, any>,
        currentUser: Record<string, any>,
        userTown?: Town,
    ) {
        // Super can always regenerate; monitors can for their town activities (not conferences).
        if (currentUser?.monitorLevel === MonitorLevel.Super) return;
        if (activity.type === ActivityType.Conference) {
            throw new ForbiddenException(
                'Only Super Monitors can regenerate conference invitations',
            );
        }
        await this.assertCanEdit(activity, currentUser, userTown);
    }

    private assertCanOverrideInvitations(
        _activity: Record<string, any>,
        currentUser: Record<string, any>,
    ) {
        const level = currentUser?.monitorLevel as MonitorLevel | undefined;
        if (!level) {
            throw new ForbiddenException('Only monitors can override invitations');
        }
        if (level !== MonitorLevel.Super && level !== MonitorLevel.Official) {
            throw new ForbiddenException(
                'Only Official and Super Monitors can override invitations',
            );
        }

        if (_activity.type === ActivityType.Conference && level !== MonitorLevel.Super) {
            throw new ForbiddenException('Only Super Monitors can override conference invitations');
        }
    }

    /*
     * NOTE: legacy methods (sync variants) removed below; RBAC checks are now async
     * because monitor town scope can come from the monitor profile collection.
     */

    private async getAgeToGroupMapping(): Promise<{ bands: AgeBand[] }> {
        return this.settingsService.getAgeToGroupMapping();
    }

    private async computeInvitations(activity: Record<string, any>) {
        const mapping = await this.getAgeToGroupMapping();
        const groups = targetGroupsForTargetingCode(activity.targetingCode as TargetingCode);
        const asOf = activity.startDate ? new Date(activity.startDate) : new Date();

        const childFilter: Record<string, any> = { role: UserRole.Child };
        if (activity.type !== ActivityType.Conference) {
            childFilter.originTown = activity.town;
        }

        const children = await this.userModel.find(childFilter).lean().exec();
        if (!children.length) {
            return {
                invitedChildrenUserIds: [],
                invitedMonitorUserIds: await this.computeMonitorInvites(activity),
            };
        }

        const childIds = children.map((c) => c._id);
        const profiles = await this.childProfileModel
            .find({ userId: { $in: childIds } })
            .lean()
            .exec();
        const profileByUserId = new Map<string, Record<string, any>>();
        for (const p of profiles) {
            profileByUserId.set(String(p.userId), p);
        }

        const invitedChildrenUserIds: Types.ObjectId[] = [];
        for (const child of children) {
            const profile = profileByUserId.get(String(child._id));
            if (
                child.lifecycleStatus === LifecycleStatus.Archived &&
                !profile?.adultOverrideAllowed
            ) {
                continue;
            }

            const group: ChildGroup | undefined =
                (profile?.currentGroup as ChildGroup | undefined) ??
                (child.dateOfBirth
                    ? computeGroupFromAge(
                          computeAgeYears(new Date(child.dateOfBirth), asOf),
                          mapping.bands,
                      )
                    : undefined);

            if (!group || !groups.includes(group)) {
                continue;
            }
            invitedChildrenUserIds.push(child._id);
        }

        const invitedMonitorUserIds = await this.computeMonitorInvites(activity);
        return { invitedChildrenUserIds, invitedMonitorUserIds };
    }

    private async validateInvitationOverride(
        activity: Record<string, any>,
        dto: UpdateActivityInvitationsDto,
    ): Promise<{ invitedChildrenUserIds?: string[]; invitedMonitorUserIds?: string[] }> {
        const out: { invitedChildrenUserIds?: string[]; invitedMonitorUserIds?: string[] } = {};

        if (dto.invitedChildrenUserIds) {
            const requested = Array.from(new Set(dto.invitedChildrenUserIds.map((x) => String(x))));
            const requestedIds = requested.map((x) => new Types.ObjectId(x));
            const mapping = await this.getAgeToGroupMapping();
            const groups = targetGroupsForTargetingCode(activity.targetingCode as TargetingCode);
            const asOf = activity.startDate ? new Date(activity.startDate) : new Date();
            const allowUnknownGroup =
                (activity.targetingCode as TargetingCode) === TargetingCode.ABCD;

            const filter: Record<string, any> = {
                _id: { $in: requestedIds },
                role: UserRole.Child,
                lifecycleStatus: LifecycleStatus.Active,
            };
            if (activity.type !== ActivityType.Conference) {
                filter.originTown = activity.town;
            }

            const children = await this.userModel
                .find(filter)
                .select({ _id: 1, dateOfBirth: 1 })
                .lean()
                .exec();
            const childById = new Map(children.map((c) => [String(c._id), c]));

            const profiles = await this.childProfileModel
                .find({ userId: { $in: requestedIds } })
                .select({ userId: 1, currentGroup: 1 })
                .lean()
                .exec();
            const profileByUserId = new Map<string, Record<string, any>>();
            for (const p of profiles) {
                profileByUserId.set(String(p.userId), p);
            }

            const invalid: string[] = [];
            const valid: string[] = [];

            for (const id of requested) {
                const child = childById.get(id);
                if (!child) {
                    invalid.push(id);
                    continue;
                }

                const profile = profileByUserId.get(id);
                const group: ChildGroup | undefined =
                    (profile?.currentGroup as ChildGroup | undefined) ??
                    (child.dateOfBirth
                        ? computeGroupFromAge(
                              computeAgeYears(new Date(child.dateOfBirth), asOf),
                              mapping.bands,
                          )
                        : undefined);

                if (!group && !allowUnknownGroup) {
                    invalid.push(id);
                    continue;
                }
                if (group && !groups.includes(group)) {
                    invalid.push(id);
                    continue;
                }

                valid.push(id);
            }

            if (invalid.length) {
                throw new BadRequestException(
                    `Some invited children are not eligible for this activity: ${invalid.join(', ')}`,
                );
            }

            out.invitedChildrenUserIds = valid;
        }

        if (dto.invitedMonitorUserIds) {
            const requested = Array.from(new Set(dto.invitedMonitorUserIds.map((x) => String(x))));
            const requestedIds = requested.map((x) => new Types.ObjectId(x));
            const filter: Record<string, any> = {
                _id: { $in: requestedIds },
                role: UserRole.Monitor,
                lifecycleStatus: LifecycleStatus.Active,
            };
            if (activity.type !== ActivityType.Conference) {
                filter.originTown = activity.town;
            }

            const monitors = await this.userModel.find(filter).select({ _id: 1 }).lean().exec();
            const found = new Set(monitors.map((m) => String(m._id)));
            const invalid = requested.filter((id) => !found.has(id));
            if (invalid.length) {
                throw new BadRequestException(
                    `Some invited monitors are not eligible for this activity: ${invalid.join(', ')}`,
                );
            }

            out.invitedMonitorUserIds = requested;
        }

        return out;
    }

    private async computeMonitorInvites(activity: Record<string, any>) {
        const filter: Record<string, any> = {
            role: UserRole.Monitor,
            lifecycleStatus: LifecycleStatus.Active,
        };
        if (activity.type !== ActivityType.Conference) {
            filter.originTown = activity.town;
        }
        const monitors = await this.userModel.find(filter).select({ _id: 1 }).lean().exec();
        return monitors.map((m) => m._id as Types.ObjectId);
    }
}
