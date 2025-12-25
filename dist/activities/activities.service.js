"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActivitiesService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const activity_enum_1 = require("../common/enums/activity.enum");
const user_enum_1 = require("../common/enums/user.enum");
const activity_schema_1 = require("../schema/activity.schema");
const user_schema_1 = require("../schema/user.schema");
const child_profile_schema_1 = require("../schema/child-profile.schema");
const attendance_schema_1 = require("../schema/attendance.schema");
const attendance_enum_1 = require("../common/enums/attendance.enum");
const groups_util_1 = require("../common/utils/groups.util");
const age_group_util_1 = require("../common/utils/age-group.util");
const date_util_1 = require("../common/utils/date.util");
const activity_targeting_util_1 = require("../common/utils/activity-targeting.util");
const town_scope_service_1 = require("../common/services/town-scope.service");
const settings_service_1 = require("../settings/settings.service");
let ActivitiesService = class ActivitiesService {
    constructor(activityModel, userModel, childProfileModel, attendanceModel, townScopeService, settingsService) {
        this.activityModel = activityModel;
        this.userModel = userModel;
        this.childProfileModel = childProfileModel;
        this.attendanceModel = attendanceModel;
        this.townScopeService = townScopeService;
        this.settingsService = settingsService;
    }
    async create(dto, currentUser) {
        const userTown = await this.townScopeService.resolveMonitorTown(currentUser);
        await this.assertCanCreate(dto, currentUser, userTown);
        const activityPayload = this.normalizeCreatePayload(dto, currentUser, userTown);
        const { invitedChildrenUserIds, invitedMonitorUserIds } = await this.computeInvitations(activityPayload);
        const created = await new this.activityModel({
            ...activityPayload,
            invitedChildrenUserIds,
            invitedMonitorUserIds,
        }).save();
        return created.toObject();
    }
    async findAll(filters, currentUser) {
        const baseQuery = {};
        if (filters.town)
            baseQuery.town = filters.town;
        if (filters.type)
            baseQuery.type = filters.type;
        if (filters.from || filters.to) {
            baseQuery.startDate = {};
            if (filters.from)
                baseQuery.startDate.$gte = new Date(filters.from);
            if (filters.to)
                baseQuery.startDate.$lte = new Date(filters.to);
        }
        if (filters.type === activity_enum_1.ActivityType.Conference &&
            filters.town &&
            filters.town !== activity_enum_1.Town.Yaounde) {
            throw new common_1.BadRequestException('Conference town is always Yaoundé');
        }
        if (currentUser && currentUser.monitorLevel !== user_enum_1.MonitorLevel.Super) {
            const userTown = await this.townScopeService.resolveMonitorTown(currentUser);
            if (!userTown) {
                throw new common_1.ForbiddenException('Monitor town not set');
            }
            if (filters.type && filters.type === activity_enum_1.ActivityType.Conference) {
            }
            else if (filters.town && filters.town !== userTown) {
                throw new common_1.ForbiddenException('Not allowed to view other towns');
            }
            const scopeQuery = {
                $or: [
                    { type: activity_enum_1.ActivityType.Conference },
                    { town: userTown, type: { $ne: activity_enum_1.ActivityType.Conference } },
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
    async findOneOrFail(id, currentUser) {
        const activity = await this.activityModel.findById(id).lean().exec();
        if (!activity)
            throw new common_1.NotFoundException('Activity not found');
        if (currentUser) {
            await this.assertCanRead(activity, currentUser);
        }
        return activity;
    }
    async update(id, dto, currentUser) {
        const existing = await this.findOneOrFail(id);
        const userTown = await this.townScopeService.resolveMonitorTown(currentUser);
        await this.assertCanEdit(existing, currentUser, userTown);
        const payload = this.normalizeUpdatePayload(existing, dto, currentUser);
        const updated = await this.activityModel
            .findByIdAndUpdate(id, { $set: payload }, { new: true })
            .lean()
            .exec();
        if (!updated)
            throw new common_1.NotFoundException('Activity not found');
        return updated;
    }
    async remove(id, currentUser) {
        const existing = await this.findOneOrFail(id);
        const userTown = await this.townScopeService.resolveMonitorTown(currentUser);
        await this.assertCanEdit(existing, currentUser, userTown);
        await this.activityModel.findByIdAndDelete(id).exec();
        return { deleted: true };
    }
    async regenerateInvitations(id, currentUser) {
        const activity = await this.findOneOrFail(id);
        const userTown = await this.townScopeService.resolveMonitorTown(currentUser);
        await this.assertCanRegenerateInvitations(activity, currentUser, userTown);
        const { invitedChildrenUserIds, invitedMonitorUserIds } = await this.computeInvitations(activity);
        const updated = await this.activityModel
            .findByIdAndUpdate(id, { $set: { invitedChildrenUserIds, invitedMonitorUserIds } }, { new: true })
            .lean()
            .exec();
        if (!updated)
            throw new common_1.NotFoundException('Activity not found');
        return updated;
    }
    async overrideInvitations(id, dto, currentUser) {
        const activity = await this.findOneOrFail(id);
        await this.assertCanRead(activity, currentUser);
        this.assertCanOverrideInvitations(activity, currentUser);
        const validated = await this.validateInvitationOverride(activity, dto);
        const update = {};
        if (validated.invitedChildrenUserIds) {
            update.invitedChildrenUserIds = validated.invitedChildrenUserIds.map((x) => new mongoose_2.Types.ObjectId(x));
        }
        if (validated.invitedMonitorUserIds) {
            update.invitedMonitorUserIds = validated.invitedMonitorUserIds.map((x) => new mongoose_2.Types.ObjectId(x));
        }
        const updated = await this.activityModel
            .findByIdAndUpdate(id, { $set: update }, { new: true })
            .lean()
            .exec();
        if (!updated)
            throw new common_1.NotFoundException('Activity not found');
        return updated;
    }
    async getInvitedChildrenDetails(activityId, currentUser) {
        const activity = await this.findOneOrFail(activityId, currentUser);
        const mapping = await this.getAgeToGroupMapping();
        const groups = (0, activity_targeting_util_1.targetGroupsForTargetingCode)(activity.targetingCode);
        const asOf = activity.startDate ? new Date(activity.startDate) : new Date();
        const invitedIds = (activity.invitedChildrenUserIds ?? []).map((x) => typeof x === 'string' ? new mongoose_2.Types.ObjectId(x) : x);
        if (!invitedIds.length) {
            return {
                activityId,
                targetGroups: groups,
                invited: [],
            };
        }
        const users = await this.userModel
            .find({ _id: { $in: invitedIds }, role: user_enum_1.UserRole.Child })
            .select({ _id: 1, fullName: 1, dateOfBirth: 1, profileImage: 1 })
            .lean()
            .exec();
        const profiles = await this.childProfileModel
            .find({ userId: { $in: invitedIds } })
            .select({ userId: 1, currentGroup: 1 })
            .lean()
            .exec();
        const profileByUserId = new Map();
        for (const p of profiles) {
            profileByUserId.set(String(p.userId), p);
        }
        const cards = users
            .map((u) => {
            const profile = profileByUserId.get(String(u._id));
            const group = profile?.currentGroup ??
                (u.dateOfBirth
                    ? (0, age_group_util_1.computeGroupFromAge)((0, groups_util_1.computeAgeYears)(new Date(u.dateOfBirth), asOf), mapping.bands)
                    : undefined);
            return {
                userId: String(u._id),
                fullName: u.fullName,
                group,
                profileImageUrl: u?.profileImage?.url,
            };
        })
            .sort((a, b) => a.fullName.localeCompare(b.fullName));
        return {
            activityId,
            targetGroups: groups,
            invited: cards,
        };
    }
    async searchEligibleChildrenForInvitations(activityId, query, limit, currentUser) {
        const activity = await this.findOneOrFail(activityId, currentUser);
        this.assertCanOverrideInvitations(activity, currentUser);
        const q = (query ?? '').trim();
        if (q.length < 2) {
            return {
                activityId,
                query: q,
                targetGroups: (0, activity_targeting_util_1.targetGroupsForTargetingCode)(activity.targetingCode),
                results: [],
            };
        }
        const max = Number.isFinite(limit) ? Math.max(1, Math.min(30, Math.floor(limit))) : 15;
        const mapping = await this.getAgeToGroupMapping();
        const groups = (0, activity_targeting_util_1.targetGroupsForTargetingCode)(activity.targetingCode);
        const asOf = activity.startDate ? new Date(activity.startDate) : new Date();
        const allowUnknownGroup = activity.targetingCode === activity_enum_1.TargetingCode.ABCD;
        const alreadyInvited = new Set((activity.invitedChildrenUserIds ?? []).map((x) => String(x)));
        const filter = {
            role: user_enum_1.UserRole.Child,
            lifecycleStatus: user_enum_1.LifecycleStatus.Active,
            fullName: { $regex: q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' },
        };
        if (activity.type !== activity_enum_1.ActivityType.Conference) {
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
        const profileByUserId = new Map();
        for (const p of profiles) {
            profileByUserId.set(String(p.userId), p);
        }
        const results = [];
        for (const c of candidates) {
            if (alreadyInvited.has(String(c._id)))
                continue;
            const profile = profileByUserId.get(String(c._id));
            const group = profile?.currentGroup ??
                (c.dateOfBirth
                    ? (0, age_group_util_1.computeGroupFromAge)((0, groups_util_1.computeAgeYears)(new Date(c.dateOfBirth), asOf), mapping.bands)
                    : undefined);
            if (!group && !allowUnknownGroup)
                continue;
            if (group && !groups.includes(group))
                continue;
            results.push({
                userId: String(c._id),
                fullName: c.fullName,
                group,
                profileImageUrl: c?.profileImage?.url,
            });
            if (results.length >= max)
                break;
        }
        return { activityId, query: q, targetGroups: groups, results };
    }
    async getConferenceEligibility(activityId, currentUser) {
        const activity = await this.findOneOrFail(activityId, currentUser);
        if (activity.type !== activity_enum_1.ActivityType.Conference) {
            throw new common_1.BadRequestException('Eligibility highlight is only for conferences');
        }
        const conferenceStart = new Date(activity.startDate);
        const windowStart = (0, date_util_1.subtractMonths)(conferenceStart, 3);
        const invitedIds = (activity.invitedChildrenUserIds ?? []).map((x) => typeof x === 'string' ? new mongoose_2.Types.ObjectId(x) : x);
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
            type: { $ne: activity_enum_1.ActivityType.Conference },
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
        const activityById = new Map();
        for (const a of candidateActivities) {
            const targetingCode = a.targetingCode;
            activityById.set(String(a._id), {
                targetingCode,
                startDate: new Date(a.startDate),
                targetGroups: (0, activity_targeting_util_1.targetGroupsForTargetingCode)(targetingCode),
            });
        }
        const attendanceDocs = await this.attendanceModel
            .find({
            activityId: { $in: candidateActivities.map((a) => a._id) },
            entries: {
                $elemMatch: {
                    userId: { $in: invitedIds },
                    present: true,
                    roleAtTime: attendance_enum_1.AttendanceRoleAtTime.Child,
                },
            },
        })
            .lean()
            .exec();
        const invitedIdStrings = invitedIds.map((x) => String(x));
        const invitedSet = new Set(invitedIdStrings);
        const qualified = new Set();
        const fallbackChecks = [];
        for (const doc of attendanceDocs) {
            const meta = activityById.get(String(doc.activityId));
            if (!meta)
                continue;
            for (const entry of doc.entries ?? []) {
                const userId = String(entry.userId);
                if (!invitedSet.has(userId))
                    continue;
                if (!entry.present)
                    continue;
                if (entry.roleAtTime !== attendance_enum_1.AttendanceRoleAtTime.Child)
                    continue;
                if (qualified.has(userId))
                    continue;
                const group = entry.groupAtTime;
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
                .find({ _id: { $in: uniqueUserIds.map((id) => new mongoose_2.Types.ObjectId(id)) } })
                .select({ _id: 1, dateOfBirth: 1 })
                .lean()
                .exec();
            const dobById = new Map();
            for (const u of users) {
                dobById.set(String(u._id), u.dateOfBirth ? new Date(u.dateOfBirth) : undefined);
            }
            for (const item of fallbackChecks) {
                if (qualified.has(item.userId))
                    continue;
                const dob = dobById.get(item.userId);
                if (!dob)
                    continue;
                const group = (0, age_group_util_1.computeGroupFromAge)((0, groups_util_1.computeAgeYears)(dob, item.activityStart), mapping.bands);
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
    normalizeCreatePayload(dto, currentUser, userTown) {
        const startDate = new Date(dto.startDate);
        const endDate = new Date(dto.endDate);
        if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
            throw new common_1.BadRequestException('Invalid startDate/endDate');
        }
        if (startDate.getTime() > endDate.getTime()) {
            throw new common_1.BadRequestException('startDate must be before endDate');
        }
        const type = dto.type;
        const town = type === activity_enum_1.ActivityType.Conference ? activity_enum_1.Town.Yaounde : userTown;
        if (type === activity_enum_1.ActivityType.Conference) {
            if (!(0, activity_targeting_util_1.isValidConferenceDuration)(dto.conferenceDurationDays)) {
                throw new common_1.BadRequestException('Conference duration must be 2 or 5 days');
            }
        }
        else if (dto.conferenceDurationDays !== undefined) {
            throw new common_1.BadRequestException('conferenceDurationDays is only allowed for conferences');
        }
        if (!town) {
            throw new common_1.ForbiddenException('Monitor town not set');
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
    normalizeUpdatePayload(existing, dto, currentUser) {
        const merged = {
            ...existing,
            ...dto,
        };
        if (dto.town !== undefined) {
            throw new common_1.BadRequestException('town cannot be edited; it is derived from the activity scope');
        }
        if (merged.type === activity_enum_1.ActivityType.Conference) {
            merged.town = activity_enum_1.Town.Yaounde;
            if (!(0, activity_targeting_util_1.isValidConferenceDuration)(merged.conferenceDurationDays)) {
                throw new common_1.BadRequestException('Conference duration must be 2 or 5 days');
            }
        }
        else if (merged.conferenceDurationDays !== undefined) {
            throw new common_1.BadRequestException('conferenceDurationDays is only allowed for conferences');
        }
        if (dto.startDate)
            merged.startDate = new Date(dto.startDate);
        if (dto.endDate)
            merged.endDate = new Date(dto.endDate);
        if (merged.startDate &&
            merged.endDate &&
            merged.startDate.getTime() > merged.endDate.getTime()) {
            throw new common_1.BadRequestException('startDate must be before endDate');
        }
        if (merged.type === activity_enum_1.ActivityType.Conference &&
            currentUser?.monitorLevel !== user_enum_1.MonitorLevel.Super) {
            throw new common_1.ForbiddenException('Only Super Monitors can manage conferences');
        }
        const payload = {};
        if (dto.type !== undefined)
            payload.type = merged.type;
        if (dto.town !== undefined)
            payload.town = merged.town;
        if (dto.startDate !== undefined)
            payload.startDate = merged.startDate;
        if (dto.endDate !== undefined)
            payload.endDate = merged.endDate;
        if (dto.conferenceDurationDays !== undefined)
            payload.conferenceDurationDays = merged.conferenceDurationDays;
        if (dto.targetingCode !== undefined)
            payload.targetingCode = merged.targetingCode;
        if (dto.notes !== undefined)
            payload.notes = merged.notes;
        return payload;
    }
    async assertCanCreate(dto, currentUser, userTown) {
        if (currentUser?.role !== user_enum_1.UserRole.Monitor) {
            throw new common_1.ForbiddenException('Only monitors can create activities');
        }
        if (currentUser?.monitorLevel === user_enum_1.MonitorLevel.Aspiring) {
            throw new common_1.ForbiddenException('Aspiring monitors cannot create activities');
        }
        if (dto.type === activity_enum_1.ActivityType.Conference &&
            currentUser?.monitorLevel !== user_enum_1.MonitorLevel.Super) {
            throw new common_1.ForbiddenException('Only Super Monitors can create conferences');
        }
        if (!userTown)
            throw new common_1.ForbiddenException('Monitor town not set');
    }
    async assertCanEdit(activity, currentUser, userTown) {
        if (currentUser?.role !== user_enum_1.UserRole.Monitor) {
            throw new common_1.ForbiddenException('Only monitors can manage activities');
        }
        if (currentUser?.monitorLevel === user_enum_1.MonitorLevel.Aspiring) {
            throw new common_1.ForbiddenException('Aspiring monitors cannot manage activities');
        }
        if (activity.type === activity_enum_1.ActivityType.Conference &&
            currentUser?.monitorLevel !== user_enum_1.MonitorLevel.Super) {
            throw new common_1.ForbiddenException('Only Super Monitors can manage conferences');
        }
        if (currentUser?.monitorLevel !== user_enum_1.MonitorLevel.Super) {
            const resolvedTown = userTown ?? (await this.townScopeService.resolveMonitorTown(currentUser));
            if (!resolvedTown)
                throw new common_1.ForbiddenException('Monitor town not set');
            if (activity.town !== resolvedTown) {
                throw new common_1.ForbiddenException('Monitors can only manage activities for their town');
            }
        }
    }
    async assertCanRead(activity, currentUser) {
        if (currentUser?.role !== user_enum_1.UserRole.Monitor) {
            throw new common_1.ForbiddenException('Only monitors can view activities');
        }
        if (currentUser?.monitorLevel === user_enum_1.MonitorLevel.Super)
            return;
        if (activity.type === activity_enum_1.ActivityType.Conference)
            return;
        const userTown = await this.townScopeService.resolveMonitorTown(currentUser);
        if (!userTown)
            throw new common_1.ForbiddenException('Monitor town not set');
        if (activity.town !== userTown) {
            throw new common_1.ForbiddenException('Not allowed to view other towns');
        }
    }
    async assertCanRegenerateInvitations(activity, currentUser, userTown) {
        if (currentUser?.monitorLevel === user_enum_1.MonitorLevel.Super)
            return;
        if (activity.type === activity_enum_1.ActivityType.Conference) {
            throw new common_1.ForbiddenException('Only Super Monitors can regenerate conference invitations');
        }
        await this.assertCanEdit(activity, currentUser, userTown);
    }
    assertCanOverrideInvitations(_activity, currentUser) {
        const level = currentUser?.monitorLevel;
        if (!level) {
            throw new common_1.ForbiddenException('Only monitors can override invitations');
        }
        if (level !== user_enum_1.MonitorLevel.Super && level !== user_enum_1.MonitorLevel.Official) {
            throw new common_1.ForbiddenException('Only Official and Super Monitors can override invitations');
        }
        if (_activity.type === activity_enum_1.ActivityType.Conference && level !== user_enum_1.MonitorLevel.Super) {
            throw new common_1.ForbiddenException('Only Super Monitors can override conference invitations');
        }
    }
    async getAgeToGroupMapping() {
        return this.settingsService.getAgeToGroupMapping();
    }
    async computeInvitations(activity) {
        const mapping = await this.getAgeToGroupMapping();
        const groups = (0, activity_targeting_util_1.targetGroupsForTargetingCode)(activity.targetingCode);
        const asOf = activity.startDate ? new Date(activity.startDate) : new Date();
        const childFilter = { role: user_enum_1.UserRole.Child };
        if (activity.type !== activity_enum_1.ActivityType.Conference) {
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
        const profileByUserId = new Map();
        for (const p of profiles) {
            profileByUserId.set(String(p.userId), p);
        }
        const invitedChildrenUserIds = [];
        for (const child of children) {
            const profile = profileByUserId.get(String(child._id));
            if (child.lifecycleStatus === user_enum_1.LifecycleStatus.Archived &&
                !profile?.adultOverrideAllowed) {
                continue;
            }
            const group = profile?.currentGroup ??
                (child.dateOfBirth
                    ? (0, age_group_util_1.computeGroupFromAge)((0, groups_util_1.computeAgeYears)(new Date(child.dateOfBirth), asOf), mapping.bands)
                    : undefined);
            if (!group || !groups.includes(group)) {
                continue;
            }
            invitedChildrenUserIds.push(child._id);
        }
        const invitedMonitorUserIds = await this.computeMonitorInvites(activity);
        return { invitedChildrenUserIds, invitedMonitorUserIds };
    }
    async validateInvitationOverride(activity, dto) {
        const out = {};
        if (dto.invitedChildrenUserIds) {
            const requested = Array.from(new Set(dto.invitedChildrenUserIds.map((x) => String(x))));
            const requestedIds = requested.map((x) => new mongoose_2.Types.ObjectId(x));
            const mapping = await this.getAgeToGroupMapping();
            const groups = (0, activity_targeting_util_1.targetGroupsForTargetingCode)(activity.targetingCode);
            const asOf = activity.startDate ? new Date(activity.startDate) : new Date();
            const allowUnknownGroup = activity.targetingCode === activity_enum_1.TargetingCode.ABCD;
            const filter = {
                _id: { $in: requestedIds },
                role: user_enum_1.UserRole.Child,
                lifecycleStatus: user_enum_1.LifecycleStatus.Active,
            };
            if (activity.type !== activity_enum_1.ActivityType.Conference) {
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
            const profileByUserId = new Map();
            for (const p of profiles) {
                profileByUserId.set(String(p.userId), p);
            }
            const invalid = [];
            const valid = [];
            for (const id of requested) {
                const child = childById.get(id);
                if (!child) {
                    invalid.push(id);
                    continue;
                }
                const profile = profileByUserId.get(id);
                const group = profile?.currentGroup ??
                    (child.dateOfBirth
                        ? (0, age_group_util_1.computeGroupFromAge)((0, groups_util_1.computeAgeYears)(new Date(child.dateOfBirth), asOf), mapping.bands)
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
                throw new common_1.BadRequestException(`Some invited children are not eligible for this activity: ${invalid.join(', ')}`);
            }
            out.invitedChildrenUserIds = valid;
        }
        if (dto.invitedMonitorUserIds) {
            const requested = Array.from(new Set(dto.invitedMonitorUserIds.map((x) => String(x))));
            const requestedIds = requested.map((x) => new mongoose_2.Types.ObjectId(x));
            const filter = {
                _id: { $in: requestedIds },
                role: user_enum_1.UserRole.Monitor,
                lifecycleStatus: user_enum_1.LifecycleStatus.Active,
            };
            if (activity.type !== activity_enum_1.ActivityType.Conference) {
                filter.originTown = activity.town;
            }
            const monitors = await this.userModel.find(filter).select({ _id: 1 }).lean().exec();
            const found = new Set(monitors.map((m) => String(m._id)));
            const invalid = requested.filter((id) => !found.has(id));
            if (invalid.length) {
                throw new common_1.BadRequestException(`Some invited monitors are not eligible for this activity: ${invalid.join(', ')}`);
            }
            out.invitedMonitorUserIds = requested;
        }
        return out;
    }
    async computeMonitorInvites(activity) {
        const filter = {
            role: user_enum_1.UserRole.Monitor,
            lifecycleStatus: user_enum_1.LifecycleStatus.Active,
        };
        if (activity.type !== activity_enum_1.ActivityType.Conference) {
            filter.originTown = activity.town;
        }
        const monitors = await this.userModel.find(filter).select({ _id: 1 }).lean().exec();
        return monitors.map((m) => m._id);
    }
};
exports.ActivitiesService = ActivitiesService;
exports.ActivitiesService = ActivitiesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(activity_schema_1.Activity.name)),
    __param(1, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __param(2, (0, mongoose_1.InjectModel)(child_profile_schema_1.ChildProfile.name)),
    __param(3, (0, mongoose_1.InjectModel)(attendance_schema_1.Attendance.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        town_scope_service_1.TownScopeService,
        settings_service_1.SettingsService])
], ActivitiesService);
//# sourceMappingURL=activities.service.js.map