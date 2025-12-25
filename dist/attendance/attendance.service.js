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
exports.AttendanceService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const activity_schema_1 = require("../schema/activity.schema");
const attendance_schema_1 = require("../schema/attendance.schema");
const user_schema_1 = require("../schema/user.schema");
const child_profile_schema_1 = require("../schema/child-profile.schema");
const attendance_enum_1 = require("../common/enums/attendance.enum");
const activity_enum_1 = require("../common/enums/activity.enum");
const user_enum_1 = require("../common/enums/user.enum");
const groups_util_1 = require("../common/utils/groups.util");
const age_group_util_1 = require("../common/utils/age-group.util");
const attendance_eligibility_util_1 = require("../common/utils/attendance-eligibility.util");
const reporting_service_1 = require("../reporting/reporting.service");
const town_scope_service_1 = require("../common/services/town-scope.service");
const settings_service_1 = require("../settings/settings.service");
const monitor_profile_schema_1 = require("../schema/monitor-profile.schema");
let AttendanceService = class AttendanceService {
    constructor(attendanceModel, activityModel, userModel, childProfileModel, monitorProfileModel, reportingService, townScopeService, settingsService) {
        this.attendanceModel = attendanceModel;
        this.activityModel = activityModel;
        this.userModel = userModel;
        this.childProfileModel = childProfileModel;
        this.monitorProfileModel = monitorProfileModel;
        this.reportingService = reportingService;
        this.townScopeService = townScopeService;
        this.settingsService = settingsService;
    }
    async getByActivityId(activityId, currentUser, scopeTown) {
        const activity = await this.activityModel.findById(activityId).lean().exec();
        if (!activity)
            throw new common_1.NotFoundException('Activity not found');
        await this.assertCanAccessAttendance(activity, currentUser);
        const resolvedScopeTown = await this.resolveScopeTown(activity, currentUser, scopeTown);
        const doc = await this.attendanceModel
            .findOne({ activityId: new mongoose_2.Types.ObjectId(activityId) })
            .lean()
            .exec();
        const out = doc ?? { activityId, entries: [], externalEntries: [] };
        if (activity.type === activity_enum_1.ActivityType.Conference && resolvedScopeTown) {
            return {
                ...out,
                entries: (out.entries ?? []).filter((e) => e.originTownAtTime === resolvedScopeTown),
                externalEntries: (out.externalEntries ?? []).filter((x) => x.scopeTown === resolvedScopeTown),
            };
        }
        return out;
    }
    async upsertForActivity(activityId, dto, currentUser, scopeTown) {
        const activity = await this.activityModel.findById(activityId).lean().exec();
        if (!activity)
            throw new common_1.NotFoundException('Activity not found');
        await this.assertCanAccessAttendance(activity, currentUser);
        const resolvedScopeTown = await this.resolveScopeTown(activity, currentUser, scopeTown);
        const now = new Date();
        const existing = await this.attendanceModel
            .findOne({ activityId: new mongoose_2.Types.ObjectId(activityId) })
            .lean()
            .exec();
        this.assertNotLocked(activity, resolvedScopeTown, now, existing);
        const allowedLabels = (await this.settingsService.getClassificationLabels())
            .labels;
        const uniqueEntries = new Map();
        for (const entry of dto.entries ?? []) {
            if (!entry?.userId)
                continue;
            if (entry.present !== true)
                continue;
            uniqueEntries.set(entry.userId, { present: true });
        }
        const userIds = [...uniqueEntries.keys()];
        const users = await this.userModel
            .find({ _id: { $in: userIds.map((id) => new mongoose_2.Types.ObjectId(id)) } })
            .lean()
            .exec();
        if (users.length !== userIds.length) {
            throw new common_1.BadRequestException('One or more users not found');
        }
        const userById = new Map();
        for (const u of users)
            userById.set(String(u._id), u);
        const monitorUserIds = users
            .filter((u) => u.role === user_enum_1.UserRole.Monitor)
            .map((u) => u._id);
        const monitorProfiles = monitorUserIds.length
            ? await this.monitorProfileModel
                .find({ userId: { $in: monitorUserIds } })
                .select({ userId: 1, homeTown: 1 })
                .lean()
                .exec()
            : [];
        const monitorProfileById = new Map();
        for (const p of monitorProfiles)
            monitorProfileById.set(String(p.userId), p);
        const childUserIds = users
            .filter((u) => u.role === user_enum_1.UserRole.Child)
            .map((u) => u._id);
        const childProfiles = childUserIds.length
            ? await this.childProfileModel
                .find({ userId: { $in: childUserIds } })
                .lean()
                .exec()
            : [];
        const childProfileById = new Map();
        for (const p of childProfiles)
            childProfileById.set(String(p.userId), p);
        const mapping = await this.getAgeToGroupMapping();
        const asOf = activity.startDate ? new Date(activity.startDate) : new Date();
        const entries = [];
        for (const userId of userIds) {
            const user = userById.get(userId);
            const input = uniqueEntries.get(userId);
            if (!user || !input)
                continue;
            if (user.role !== user_enum_1.UserRole.Child && user.role !== user_enum_1.UserRole.Monitor) {
                throw new common_1.BadRequestException('Invalid user role for attendance');
            }
            const roleAtTime = user.role === user_enum_1.UserRole.Child
                ? attendance_enum_1.AttendanceRoleAtTime.Child
                : attendance_enum_1.AttendanceRoleAtTime.Monitor;
            const userTownAtTime = user.role === user_enum_1.UserRole.Monitor
                ? (monitorProfileById.get(userId)?.homeTown ??
                    user.originTown)
                : user.originTown;
            let groupAtTime;
            if (user.role === user_enum_1.UserRole.Child) {
                const profile = childProfileById.get(userId);
                if (user.lifecycleStatus === user_enum_1.LifecycleStatus.Archived &&
                    !profile?.adultOverrideAllowed) {
                    throw new common_1.BadRequestException('Archived adult is not eligible unless allowed by leadership');
                }
                if (activity.type !== activity_enum_1.ActivityType.Conference) {
                    if (userTownAtTime && activity.town !== userTownAtTime) {
                        throw new common_1.BadRequestException('Child origin town does not match this activity town');
                    }
                }
                else if (resolvedScopeTown &&
                    userTownAtTime &&
                    userTownAtTime !== resolvedScopeTown) {
                    throw new common_1.BadRequestException('Child origin town does not match this attendance scope');
                }
                if (user.lifecycleStatus !== user_enum_1.LifecycleStatus.Archived) {
                    groupAtTime =
                        profile?.currentGroup ??
                            (user.dateOfBirth
                                ? (0, age_group_util_1.computeGroupFromAge)((0, groups_util_1.computeAgeYears)(new Date(user.dateOfBirth), asOf), mapping.bands)
                                : undefined);
                }
                else {
                    groupAtTime = undefined;
                }
                if (groupAtTime) {
                    const ok = (0, attendance_eligibility_util_1.isEligibleChildForActivity)(activity.targetingCode, groupAtTime);
                    if (!ok) {
                        throw new common_1.BadRequestException('Child group is not eligible for this activity');
                    }
                }
            }
            if (user.role === user_enum_1.UserRole.Monitor) {
                if (!userTownAtTime) {
                    throw new common_1.BadRequestException('Monitor town not set');
                }
                if (activity.type !== activity_enum_1.ActivityType.Conference) {
                    if (activity.town !== userTownAtTime) {
                        throw new common_1.BadRequestException('Monitor town does not match this activity town');
                    }
                }
                else if (resolvedScopeTown && userTownAtTime !== resolvedScopeTown) {
                    throw new common_1.BadRequestException('Monitor town does not match this attendance scope');
                }
            }
            const classificationLabel = roleAtTime === attendance_enum_1.AttendanceRoleAtTime.Monitor
                ? attendance_enum_1.ClassificationLabel.Monitor
                : this.classificationForChildGroup(groupAtTime);
            entries.push({
                userId: new mongoose_2.Types.ObjectId(userId),
                present: true,
                roleAtTime,
                originTownAtTime: userTownAtTime,
                groupAtTime,
                classificationLabel,
            });
        }
        const externalInput = dto.externalEntries ?? [];
        const externalById = new Map();
        for (const x of externalInput) {
            if (!x)
                continue;
            const label = x.classificationLabel;
            if (!allowedLabels.includes(label)) {
                throw new common_1.BadRequestException('Invalid classificationLabel');
            }
            const externalId = String(x.externalId ?? '').trim();
            const fullName = String(x.fullName ?? '').trim();
            if (!externalId)
                continue;
            if (!fullName || fullName.length < 2)
                continue;
            externalById.set(externalId, { fullName, classificationLabel: label });
        }
        const externalEntries = [...externalById.entries()].map(([externalId, value]) => ({
            externalId,
            fullName: value.fullName,
            classificationLabel: value.classificationLabel,
            ...(activity.type === activity_enum_1.ActivityType.Conference && resolvedScopeTown
                ? { scopeTown: resolvedScopeTown }
                : {}),
        }));
        const takenByUserId = currentUser?._id ?? currentUser?.id;
        const takenAt = now;
        const existingEntries = existing?.entries ?? [];
        const nextEntries = activity.type === activity_enum_1.ActivityType.Conference && resolvedScopeTown
            ? [
                ...existingEntries.filter((e) => e.originTownAtTime !== resolvedScopeTown),
                ...entries,
            ]
            : entries;
        const existingExternalEntries = existing?.externalEntries ?? [];
        const nextExternalEntries = activity.type === activity_enum_1.ActivityType.Conference && resolvedScopeTown
            ? [
                ...existingExternalEntries.filter((x) => x.scopeTown !== resolvedScopeTown),
                ...externalEntries,
            ]
            : externalEntries;
        const updated = await this.attendanceModel
            .findOneAndUpdate({ activityId: new mongoose_2.Types.ObjectId(activityId) }, {
            $set: {
                activityId: new mongoose_2.Types.ObjectId(activityId),
                takenByUserId: takenByUserId
                    ? new mongoose_2.Types.ObjectId(String(takenByUserId))
                    : undefined,
                takenAt,
                entries: nextEntries,
                externalEntries: nextExternalEntries,
            },
        }, { upsert: true, new: true })
            .lean()
            .exec();
        if (!updated) {
            throw new common_1.NotFoundException('Attendance not found');
        }
        try {
            await this.reportingService.notifySuperMonitorsAfterAttendance(activityId);
        }
        catch {
        }
        if (activity.type === activity_enum_1.ActivityType.Conference && resolvedScopeTown) {
            return {
                ...updated,
                entries: (updated.entries ?? []).filter((e) => e.originTownAtTime === resolvedScopeTown),
                externalEntries: (updated.externalEntries ?? []).filter((x) => x.scopeTown === resolvedScopeTown),
            };
        }
        return updated;
    }
    async getRoster(activityId, currentUser, scopeTown) {
        const activity = await this.activityModel.findById(activityId).lean().exec();
        if (!activity)
            throw new common_1.NotFoundException('Activity not found');
        await this.assertCanAccessAttendance(activity, currentUser);
        const resolvedScopeTown = await this.resolveScopeTown(activity, currentUser, scopeTown);
        const allowedLabels = (await this.settingsService.getClassificationLabels())
            .labels;
        const attendance = await this.attendanceModel
            .findOne({ activityId: new mongoose_2.Types.ObjectId(activityId) })
            .lean()
            .exec();
        const relevantAttendanceEntries = activity.type === activity_enum_1.ActivityType.Conference && resolvedScopeTown
            ? (attendance?.entries ?? []).filter((e) => e.originTownAtTime === resolvedScopeTown)
            : (attendance?.entries ?? []);
        const presentUserIds = new Set(relevantAttendanceEntries
            .filter((e) => e.present === true)
            .map((e) => String(e.userId)));
        const relevantExternalEntries = activity.type === activity_enum_1.ActivityType.Conference && resolvedScopeTown
            ? (attendance?.externalEntries ?? []).filter((x) => x.scopeTown === resolvedScopeTown)
            : (attendance?.externalEntries ?? []);
        const mapping = await this.getAgeToGroupMapping();
        const asOf = activity.startDate ? new Date(activity.startDate) : new Date();
        const rosterTown = (activity.type === activity_enum_1.ActivityType.Conference ? resolvedScopeTown : activity.town);
        const invitedChildIds = new Set((activity.invitedChildrenUserIds ?? []).map((x) => String(x)).filter(Boolean));
        const attendanceChildIds = new Set(relevantAttendanceEntries
            .filter((e) => e.roleAtTime === attendance_enum_1.AttendanceRoleAtTime.Child)
            .map((e) => String(e.userId)));
        const childIds = [...new Set([...invitedChildIds, ...attendanceChildIds])];
        const childUsers = childIds.length
            ? await this.userModel
                .find({
                _id: { $in: childIds.map((id) => new mongoose_2.Types.ObjectId(id)) },
                role: user_enum_1.UserRole.Child,
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
                .find({ userId: { $in: childUsers.map((u) => u._id) } })
                .select({ userId: 1, currentGroup: 1, adultOverrideAllowed: 1 })
                .lean()
                .exec()
            : [];
        const childProfileById = new Map();
        for (const p of childProfiles)
            childProfileById.set(String(p.userId), p);
        const children = childUsers
            .filter((u) => {
            if (activity.type === activity_enum_1.ActivityType.Conference) {
                return u.originTown === rosterTown;
            }
            return u.originTown === activity.town;
        })
            .filter((u) => {
            if (u.lifecycleStatus !== user_enum_1.LifecycleStatus.Archived)
                return true;
            return !!childProfileById.get(String(u._id))?.adultOverrideAllowed;
        })
            .map((u) => {
            const profile = childProfileById.get(String(u._id));
            const group = profile?.currentGroup ??
                (u.dateOfBirth
                    ? (0, age_group_util_1.computeGroupFromAge)((0, groups_util_1.computeAgeYears)(new Date(u.dateOfBirth), asOf), mapping.bands)
                    : undefined);
            return {
                userId: String(u._id),
                fullName: u.fullName,
                role: attendance_enum_1.AttendanceRoleAtTime.Child,
                group,
                profileImageUrl: u?.profileImage?.url ?? undefined,
                present: presentUserIds.has(String(u._id)),
                classificationLabel: this.classificationForChildGroup(group),
            };
        })
            .sort((a, b) => a.fullName.localeCompare(b.fullName));
        const monitors = await this.listMonitorsForTown(rosterTown);
        const monitorRoster = monitors
            .map((u) => {
            return {
                userId: String(u._id),
                fullName: u.fullName,
                role: attendance_enum_1.AttendanceRoleAtTime.Monitor,
                profileImageUrl: u?.profileImage?.url ?? undefined,
                present: presentUserIds.has(String(u._id)),
                classificationLabel: attendance_enum_1.ClassificationLabel.Monitor,
            };
        })
            .sort((a, b) => a.fullName.localeCompare(b.fullName));
        const now = new Date();
        const locked = this.isLocked(activity, resolvedScopeTown, now, attendance);
        const externalParticipants = (relevantExternalEntries ?? []).map((x) => ({
            userId: `external:${String(x.externalId)}`,
            fullName: String(x.fullName),
            role: 'external',
            classificationLabel: x.classificationLabel,
            present: true,
        }));
        return {
            activityId,
            activityType: activity.type,
            activityTown: activity.town,
            targetingCode: activity.targetingCode,
            startDate: new Date(activity.startDate),
            endDate: new Date(activity.endDate),
            scopeTown: activity.type === activity_enum_1.ActivityType.Conference ? resolvedScopeTown : undefined,
            takenAt: attendance?.takenAt ? new Date(attendance.takenAt) : undefined,
            locked,
            lockReason: locked ? 'Attendance is locked after activity ends' : undefined,
            classificationLabels: allowedLabels,
            participants: [...children, ...monitorRoster, ...externalParticipants].sort((a, b) => a.fullName.localeCompare(b.fullName)),
            externalEntries: (relevantExternalEntries ?? []).map((x) => ({
                externalId: String(x.externalId),
                fullName: String(x.fullName),
                classificationLabel: x.classificationLabel,
            })),
        };
    }
    async searchEligibleChildren(activityId, query, limit, currentUser, scopeTown) {
        const activity = await this.activityModel.findById(activityId).lean().exec();
        if (!activity)
            throw new common_1.NotFoundException('Activity not found');
        await this.assertCanAccessAttendance(activity, currentUser);
        const resolvedScopeTown = await this.resolveScopeTown(activity, currentUser, scopeTown);
        const rosterTown = (activity.type === activity_enum_1.ActivityType.Conference ? resolvedScopeTown : activity.town);
        const q = (query ?? '').trim();
        if (q.length < 2) {
            return { activityId, query: q, scopeTown: resolvedScopeTown, results: [] };
        }
        const max = Number.isFinite(limit) ? Math.max(1, Math.min(30, Math.floor(limit))) : 15;
        const mapping = await this.getAgeToGroupMapping();
        const asOf = activity.startDate ? new Date(activity.startDate) : new Date();
        const allowUnknownGroup = activity.targetingCode === activity_enum_1.TargetingCode.ABCD;
        const filter = {
            role: user_enum_1.UserRole.Child,
            originTown: rosterTown,
            fullName: { $regex: q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' },
            lifecycleStatus: { $in: [user_enum_1.LifecycleStatus.Active, user_enum_1.LifecycleStatus.Archived] },
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
        const candidateIds = candidates.map((c) => c._id);
        const profiles = await this.childProfileModel
            .find({ userId: { $in: candidateIds } })
            .select({ userId: 1, currentGroup: 1, adultOverrideAllowed: 1 })
            .lean()
            .exec();
        const profileByUserId = new Map();
        for (const p of profiles)
            profileByUserId.set(String(p.userId), p);
        const results = [];
        for (const c of candidates) {
            const profile = profileByUserId.get(String(c._id));
            if (c.lifecycleStatus === user_enum_1.LifecycleStatus.Archived && !profile?.adultOverrideAllowed) {
                continue;
            }
            const group = profile?.currentGroup ??
                (c.dateOfBirth
                    ? (0, age_group_util_1.computeGroupFromAge)((0, groups_util_1.computeAgeYears)(new Date(c.dateOfBirth), asOf), mapping.bands)
                    : undefined);
            if (!group && !allowUnknownGroup)
                continue;
            if (group) {
                const ok = (0, attendance_eligibility_util_1.isEligibleChildForActivity)(activity.targetingCode, group);
                if (!ok)
                    continue;
            }
            results.push({
                userId: String(c._id),
                fullName: c.fullName,
                group,
                profileImageUrl: c?.profileImage?.url,
            });
            if (results.length >= max)
                break;
        }
        return { activityId, query: q, scopeTown: resolvedScopeTown, results };
    }
    async assertCanAccessAttendance(activity, currentUser) {
        if (currentUser?.role !== user_enum_1.UserRole.Monitor) {
            throw new common_1.ForbiddenException('Only monitors can access attendance');
        }
        if (currentUser?.monitorLevel === user_enum_1.MonitorLevel.Super)
            return;
        if (activity.type === activity_enum_1.ActivityType.Conference)
            return;
        const userTown = await this.townScopeService.resolveMonitorTown(currentUser);
        if (!userTown)
            throw new common_1.ForbiddenException('Monitor town not set');
        if (activity.town !== userTown) {
            throw new common_1.ForbiddenException('Monitors can only take attendance for their town activities');
        }
    }
    async getAgeToGroupMapping() {
        return this.settingsService.getAgeToGroupMapping();
    }
    async resolveScopeTown(activity, currentUser, requested) {
        if (activity.type !== activity_enum_1.ActivityType.Conference)
            return undefined;
        const userTown = await this.townScopeService.resolveMonitorTown(currentUser);
        if (!userTown)
            throw new common_1.ForbiddenException('Monitor town not set');
        if (currentUser?.monitorLevel === user_enum_1.MonitorLevel.Super && requested) {
            return requested;
        }
        return userTown;
    }
    isLocked(activity, scopeTown, now, existing) {
        if (now <= new Date(activity.endDate))
            return false;
        const entries = existing?.entries ?? [];
        const externalEntries = existing?.externalEntries ?? [];
        if (activity.type !== activity_enum_1.ActivityType.Conference) {
            return !!entries.length || !!externalEntries.length;
        }
        if (!scopeTown)
            return true;
        const hasScopedEntries = entries.some((e) => e.originTownAtTime === scopeTown);
        const hasScopedExternal = externalEntries.some((x) => x.scopeTown === scopeTown);
        return hasScopedEntries || hasScopedExternal;
    }
    assertNotLocked(activity, scopeTown, now, existing) {
        if (!this.isLocked(activity, scopeTown, now, existing))
            return;
        throw new common_1.ForbiddenException('Attendance is locked after activity ends');
    }
    async listMonitorsForTown(town) {
        const profileMatches = await this.monitorProfileModel
            .find({ homeTown: town })
            .select({ userId: 1 })
            .lean()
            .exec();
        const idsFromProfiles = profileMatches.map((p) => p.userId);
        const fallback = await this.userModel
            .find({ role: user_enum_1.UserRole.Monitor, originTown: town })
            .select({ _id: 1 })
            .lean()
            .exec();
        const idsFromUsers = fallback.map((u) => u._id);
        const ids = [...new Set([...idsFromProfiles, ...idsFromUsers].map((x) => String(x)))].map((id) => new mongoose_2.Types.ObjectId(id));
        if (!ids.length)
            return [];
        return this.userModel
            .find({
            _id: { $in: ids },
            role: user_enum_1.UserRole.Monitor,
            lifecycleStatus: user_enum_1.LifecycleStatus.Active,
            registrationPendingApproval: false,
        })
            .select({ _id: 1, fullName: 1, profileImage: 1 })
            .lean()
            .exec();
    }
    classificationForChildGroup(group) {
        if (!group)
            return undefined;
        if (group === 'Pre A')
            return attendance_enum_1.ClassificationLabel.PreA;
        if (group === 'A')
            return attendance_enum_1.ClassificationLabel.A;
        if (group === 'B')
            return attendance_enum_1.ClassificationLabel.B;
        if (group === 'C')
            return attendance_enum_1.ClassificationLabel.C;
        if (group === 'D')
            return attendance_enum_1.ClassificationLabel.D;
        return undefined;
    }
};
exports.AttendanceService = AttendanceService;
exports.AttendanceService = AttendanceService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(attendance_schema_1.Attendance.name)),
    __param(1, (0, mongoose_1.InjectModel)(activity_schema_1.Activity.name)),
    __param(2, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __param(3, (0, mongoose_1.InjectModel)(child_profile_schema_1.ChildProfile.name)),
    __param(4, (0, mongoose_1.InjectModel)(monitor_profile_schema_1.MonitorProfile.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        reporting_service_1.ReportingService,
        town_scope_service_1.TownScopeService,
        settings_service_1.SettingsService])
], AttendanceService);
//# sourceMappingURL=attendance.service.js.map