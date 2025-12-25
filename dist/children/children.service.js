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
exports.ChildrenService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const town_scope_service_1 = require("../common/services/town-scope.service");
const media_service_1 = require("../media/media.service");
const settings_service_1 = require("../settings/settings.service");
const notifications_service_1 = require("../notifications/notifications.service");
const app_config_service_1 = require("../config/app-config.service");
const user_schema_1 = require("../schema/user.schema");
const child_profile_schema_1 = require("../schema/child-profile.schema");
const user_enum_1 = require("../common/enums/user.enum");
const age_group_util_1 = require("../common/utils/age-group.util");
const groups_util_1 = require("../common/utils/groups.util");
const notification_enum_1 = require("../common/enums/notification.enum");
const users_service_1 = require("../users/users.service");
const attendance_schema_1 = require("../schema/attendance.schema");
const activity_schema_1 = require("../schema/activity.schema");
const attendance_enum_1 = require("../common/enums/attendance.enum");
let ChildrenService = class ChildrenService {
    constructor(userModel, childProfileModel, attendanceModel, activityModel, townScopeService, settingsService, mediaService, notificationService, usersService, config) {
        this.userModel = userModel;
        this.childProfileModel = childProfileModel;
        this.attendanceModel = attendanceModel;
        this.activityModel = activityModel;
        this.townScopeService = townScopeService;
        this.settingsService = settingsService;
        this.mediaService = mediaService;
        this.notificationService = notificationService;
        this.usersService = usersService;
        this.config = config;
    }
    async list(filters, currentUser) {
        const scopeTown = await this.resolveMonitorTownOrFail(currentUser);
        const isSuper = currentUser?.monitorLevel === user_enum_1.MonitorLevel.Super;
        const q = (filters.q ?? '').trim();
        const includeArchived = !!filters.includeArchived && isSuper;
        const limit = Number.isFinite(filters.limit)
            ? Math.max(1, Math.min(50, Math.floor(filters.limit)))
            : 20;
        const page = Number.isFinite(filters.page)
            ? Math.max(1, Math.floor(filters.page))
            : 1;
        const skip = (page - 1) * limit;
        const query = { role: user_enum_1.UserRole.Child };
        if (!includeArchived)
            query.lifecycleStatus = user_enum_1.LifecycleStatus.Active;
        if (!isSuper)
            query.originTown = scopeTown;
        if (q.length >= 2) {
            query.fullName = {
                $regex: q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
                $options: 'i',
            };
        }
        const [total, missingProfileImageCount, users] = await Promise.all([
            this.userModel.countDocuments(query).exec(),
            this.userModel
                .countDocuments({
                ...query,
                $or: [
                    { profileImage: { $exists: false } },
                    { 'profileImage.url': { $exists: false } },
                    { 'profileImage.url': null },
                    { 'profileImage.url': '' },
                ],
            })
                .exec(),
            this.userModel.find(query).sort({ fullName: 1 }).skip(skip).limit(limit).lean().exec(),
        ]);
        if (!users.length) {
            return { items: [], page, limit, total, missingProfileImageCount };
        }
        const ids = users.map((u) => u._id);
        const profiles = await this.childProfileModel
            .find({ userId: { $in: ids } })
            .select({ userId: 1, currentGroup: 1, guardians: 1 })
            .lean()
            .exec();
        const groupById = new Map();
        const guardiansById = new Map();
        for (const p of profiles) {
            groupById.set(String(p.userId), p.currentGroup);
            guardiansById.set(String(p.userId), p.guardians ?? []);
        }
        return {
            items: users.map((u) => ({
                ...u,
                group: groupById.get(String(u._id)),
                guardians: guardiansById.get(String(u._id)) ?? [],
            })),
            page,
            limit,
            total,
            missingProfileImageCount,
        };
    }
    async get(id, currentUser) {
        const scopeTown = await this.resolveMonitorTownOrFail(currentUser);
        const isSuper = currentUser?.monitorLevel === user_enum_1.MonitorLevel.Super;
        const user = await this.userModel.findById(id).lean().exec();
        if (!user || user.role !== user_enum_1.UserRole.Child)
            throw new common_1.NotFoundException('Child not found');
        if (!isSuper && user.originTown !== scopeTown) {
            throw new common_1.ForbiddenException('Not allowed to access other towns');
        }
        const profile = await this.childProfileModel.findOne({ userId: user._id }).lean().exec();
        return {
            ...user,
            group: profile?.currentGroup,
            guardians: profile?.guardians ?? [],
        };
    }
    async create(dto, file, currentUser) {
        const scopeTown = await this.resolveMonitorTownOrFail(currentUser);
        this.assertCanCreate(currentUser);
        const dob = new Date(dto.dateOfBirth);
        if (Number.isNaN(dob.getTime())) {
            throw new common_1.BadRequestException('Invalid dateOfBirth');
        }
        const ageYears = (0, groups_util_1.computeAgeYears)(dob, new Date());
        if (ageYears < 0) {
            throw new common_1.BadRequestException('Invalid dateOfBirth');
        }
        if (ageYears >= 19) {
            throw new common_1.BadRequestException('Adults are out of scope (child must be 18 or younger)');
        }
        const guardians = this.parseGuardians(dto.guardiansJson);
        const profileImage = file ? await this.mediaService.uploadProfileImage(file) : undefined;
        const whatsApp = dto.whatsAppPhoneE164
            ? {
                phoneE164: dto.whatsAppPhoneE164,
                optIn: dto.whatsAppOptIn ?? true,
            }
            : undefined;
        const user = await new this.userModel({
            fullName: dto.fullName,
            role: user_enum_1.UserRole.Child,
            dateOfBirth: dob,
            originTown: scopeTown,
            preferredLanguage: dto.preferredLanguage ?? 'en',
            whatsApp,
            profileImage,
            lifecycleStatus: user_enum_1.LifecycleStatus.Active,
        }).save();
        const mapping = await this.settingsService.getAgeToGroupMapping();
        const group = (0, age_group_util_1.computeGroupFromAge)(ageYears, mapping.bands);
        await this.childProfileModel.findOneAndUpdate({ userId: user._id }, { $set: { currentGroup: group, groupComputedAt: new Date(), guardians } }, { upsert: true });
        await this.notifyChildCreated({
            childId: String(user._id),
            childName: user.fullName,
            town: scopeTown,
            group,
        });
        return { ...user.toObject(), group, guardians };
    }
    async bulkCreate(children, currentUser) {
        const scopeTown = await this.resolveMonitorTownOrFail(currentUser);
        this.assertCanCreate(currentUser);
        const mapping = await this.settingsService.getAgeToGroupMapping();
        const now = new Date();
        const created = [];
        const errors = [];
        for (let i = 0; i < children.length; i += 1) {
            const item = children[i];
            try {
                const dob = new Date(item.dateOfBirth);
                if (Number.isNaN(dob.getTime())) {
                    throw new common_1.BadRequestException('Invalid dateOfBirth');
                }
                const ageYears = (0, groups_util_1.computeAgeYears)(dob, now);
                if (ageYears < 0) {
                    throw new common_1.BadRequestException('Invalid dateOfBirth');
                }
                if (ageYears >= 19) {
                    throw new common_1.BadRequestException('Adults are out of scope (child must be 18 or younger)');
                }
                const whatsApp = item.whatsAppPhoneE164
                    ? {
                        phoneE164: item.whatsAppPhoneE164,
                        optIn: item.whatsAppOptIn ?? true,
                    }
                    : undefined;
                const user = await new this.userModel({
                    fullName: item.fullName,
                    role: user_enum_1.UserRole.Child,
                    dateOfBirth: dob,
                    originTown: scopeTown,
                    preferredLanguage: item.preferredLanguage ?? 'en',
                    whatsApp,
                    lifecycleStatus: user_enum_1.LifecycleStatus.Active,
                }).save();
                const group = (0, age_group_util_1.computeGroupFromAge)(ageYears, mapping.bands);
                await this.childProfileModel.findOneAndUpdate({ userId: user._id }, {
                    $set: {
                        currentGroup: group,
                        groupComputedAt: now,
                        guardians: (item.guardians ?? []),
                    },
                }, { upsert: true });
                created.push({ ...user.toObject(), group, guardians: item.guardians });
            }
            catch (err) {
                const message = err?.message ?? 'Invalid child record';
                errors.push({ index: i, message });
            }
        }
        if (created.length) {
            await this.notifyChildrenBulkCreated({
                town: scopeTown,
                totalCreated: created.length,
                sampleNames: created.slice(0, 10).map((c) => c.fullName),
            });
        }
        return { created, errors };
    }
    async uploadProfileImage(childId, file, currentUser) {
        if (!file)
            throw new common_1.BadRequestException('No file uploaded');
        const child = await this.userModel.findById(childId).lean().exec();
        if (!child || child.role !== user_enum_1.UserRole.Child)
            throw new common_1.NotFoundException('Child not found');
        await this.assertCanManageChild(currentUser, child);
        const profileImage = await this.mediaService.uploadProfileImage(file);
        const updated = await this.userModel
            .findByIdAndUpdate(childId, { $set: { profileImage } }, { new: true })
            .lean()
            .exec();
        if (!updated)
            throw new common_1.NotFoundException('Child not found');
        const profile = await this.childProfileModel.findOne({ userId: updated._id }).lean().exec();
        return {
            ...updated,
            group: profile?.currentGroup,
            guardians: profile?.guardians ?? [],
        };
    }
    async archive(childId, currentUser) {
        const child = await this.userModel.findById(childId).lean().exec();
        if (!child || child.role !== user_enum_1.UserRole.Child)
            throw new common_1.NotFoundException('Child not found');
        await this.assertCanManageChild(currentUser, child);
        const updated = await this.userModel
            .findByIdAndUpdate(childId, {
            $set: {
                lifecycleStatus: user_enum_1.LifecycleStatus.Archived,
                archivedReason: 'manual_archive',
            },
        }, { new: true })
            .lean()
            .exec();
        if (!updated)
            throw new common_1.NotFoundException('Child not found');
        const profile = await this.childProfileModel.findOne({ userId: updated._id }).lean().exec();
        return {
            ...updated,
            group: profile?.currentGroup,
            guardians: profile?.guardians ?? [],
        };
    }
    async getStats(childId, currentUser) {
        await this.get(childId, currentUser);
        const childObjId = new mongoose_2.Types.ObjectId(childId);
        const rows = await this.attendanceModel
            .aggregate([
            {
                $match: {
                    entries: {
                        $elemMatch: {
                            userId: childObjId,
                            roleAtTime: attendance_enum_1.AttendanceRoleAtTime.Child,
                        },
                    },
                },
            },
            { $unwind: '$entries' },
            {
                $match: {
                    'entries.userId': childObjId,
                    'entries.roleAtTime': attendance_enum_1.AttendanceRoleAtTime.Child,
                },
            },
            {
                $lookup: {
                    from: this.activityModel.collection.name,
                    localField: 'activityId',
                    foreignField: '_id',
                    as: 'activity',
                },
            },
            { $unwind: '$activity' },
            {
                $project: {
                    present: '$entries.present',
                    activityType: '$activity.type',
                    startDate: '$activity.startDate',
                },
            },
            {
                $group: {
                    _id: '$activityType',
                    totalRecords: { $sum: 1 },
                    presentCount: {
                        $sum: {
                            $cond: [{ $eq: ['$present', true] }, 1, 0],
                        },
                    },
                    absentCount: {
                        $sum: {
                            $cond: [{ $eq: ['$present', false] }, 1, 0],
                        },
                    },
                    lastAttendanceAt: { $max: '$startDate' },
                    lastPresentAt: {
                        $max: {
                            $cond: [{ $eq: ['$present', true] }, '$startDate', null],
                        },
                    },
                },
            },
        ])
            .exec();
        const byType = rows.map((r) => ({
            activityType: r._id,
            totalRecords: r.totalRecords,
            presentCount: r.presentCount,
            absentCount: r.absentCount,
            lastPresentAt: r.lastPresentAt ? new Date(r.lastPresentAt) : undefined,
        }));
        const totalAttendanceRecords = byType.reduce((sum, r) => sum + r.totalRecords, 0);
        const presentCount = byType.reduce((sum, r) => sum + r.presentCount, 0);
        const absentCount = byType.reduce((sum, r) => sum + r.absentCount, 0);
        const lastAttendanceAtMs = rows.length
            ? Math.max(...rows.map((r) => new Date(r.lastAttendanceAt).getTime()))
            : undefined;
        const lastAttendanceAt = typeof lastAttendanceAtMs === 'number' ? new Date(lastAttendanceAtMs) : undefined;
        const presentMs = rows
            .map((r) => (r.lastPresentAt ? new Date(r.lastPresentAt).getTime() : undefined))
            .filter((x) => typeof x === 'number' && x > 0);
        const lastPresentAtMs = presentMs.length ? Math.max(...presentMs) : undefined;
        const lastPresentAt = typeof lastPresentAtMs === 'number' ? new Date(lastPresentAtMs) : undefined;
        return {
            childId,
            totalAttendanceRecords,
            presentCount,
            absentCount,
            lastAttendanceAt,
            lastPresentAt: presentCount ? lastPresentAt : undefined,
            byActivityType: byType,
        };
    }
    assertCanCreate(currentUser) {
        const level = currentUser?.monitorLevel;
        if (currentUser?.role !== user_enum_1.UserRole.Monitor) {
            throw new common_1.ForbiddenException('Only monitors can create children');
        }
        if (level !== user_enum_1.MonitorLevel.Official && level !== user_enum_1.MonitorLevel.Super) {
            throw new common_1.ForbiddenException('Only Official and Super Monitors can create children');
        }
    }
    async assertCanManageChild(currentUser, child) {
        this.assertCanCreate(currentUser);
        if (currentUser?.monitorLevel === user_enum_1.MonitorLevel.Super)
            return;
        const town = await this.resolveMonitorTownOrFail(currentUser);
        if (child.originTown !== town) {
            throw new common_1.ForbiddenException('Not allowed to manage other towns');
        }
    }
    async resolveMonitorTownOrFail(currentUser) {
        const town = await this.townScopeService.resolveMonitorTown(currentUser);
        if (!town)
            throw new common_1.ForbiddenException('Monitor town not set');
        return town;
    }
    async notifyChildCreated(params) {
        const recipients = await this.usersService.findSuperMonitorsByTownForApproval(params.town);
        if (!recipients.length)
            return;
        const appUrl = `${this.config.frontendBaseUrl}/children/${params.childId}`;
        const subject = `New child created — ${params.town}`;
        const message = `A child profile was created.\n\n` +
            `Name: ${params.childName}\n` +
            `Town: ${params.town}\n` +
            `Group: ${params.group ?? 'Unknown'}\n\n` +
            `Open: ${appUrl}`;
        for (const r of recipients) {
            const to = r.email;
            if (!to)
                continue;
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
                contextType: notification_enum_1.NotificationContextType.Child,
                contextId: `child_created:${params.childId}`,
            });
        }
    }
    async notifyChildrenBulkCreated(params) {
        const recipients = await this.usersService.findSuperMonitorsByTownForApproval(params.town);
        if (!recipients.length)
            return;
        const listUrl = `${this.config.frontendBaseUrl}/children`;
        const subject = `Children created (bulk) — ${params.town}`;
        const sample = params.sampleNames.length
            ? `\nSample:\n- ${params.sampleNames.join('\n- ')}`
            : '';
        const message = `Bulk child creation completed.\n\n` +
            `Town: ${params.town}\n` +
            `Created: ${params.totalCreated}\n` +
            sample +
            `\n\nOpen list: ${listUrl}`;
        for (const r of recipients) {
            const to = r.email;
            if (!to)
                continue;
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
                contextType: notification_enum_1.NotificationContextType.Child,
                contextId: `children_bulk_created:${params.town}:${Date.now()}`,
            });
        }
    }
    parseGuardians(raw) {
        const trimmed = (raw ?? '').trim();
        if (!trimmed) {
            throw new common_1.BadRequestException('guardiansJson is required');
        }
        let parsed;
        try {
            parsed = JSON.parse(trimmed);
        }
        catch {
            throw new common_1.BadRequestException('guardiansJson must be valid JSON');
        }
        if (!Array.isArray(parsed) || parsed.length < 1) {
            throw new common_1.BadRequestException('At least one parent/guardian is required');
        }
        const guardians = [];
        for (const item of parsed) {
            if (!item || typeof item !== 'object') {
                throw new common_1.BadRequestException('Invalid guardian entry');
            }
            const g = item;
            const fullName = String(g.fullName ?? '').trim();
            const phoneE164 = String(g.phoneE164 ?? '').trim();
            const relationship = String(g.relationship ?? '').trim();
            const email = g.email ? String(g.email).trim() : undefined;
            if (!fullName || !phoneE164 || !relationship) {
                throw new common_1.BadRequestException('Each guardian requires fullName, phoneE164, relationship');
            }
            guardians.push({ fullName, phoneE164, relationship, email: email || undefined });
        }
        return guardians;
    }
};
exports.ChildrenService = ChildrenService;
exports.ChildrenService = ChildrenService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __param(1, (0, mongoose_1.InjectModel)(child_profile_schema_1.ChildProfile.name)),
    __param(2, (0, mongoose_1.InjectModel)(attendance_schema_1.Attendance.name)),
    __param(3, (0, mongoose_1.InjectModel)(activity_schema_1.Activity.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        town_scope_service_1.TownScopeService,
        settings_service_1.SettingsService,
        media_service_1.MediaService,
        notifications_service_1.NotificationService,
        users_service_1.UsersService,
        app_config_service_1.AppConfigService])
], ChildrenService);
//# sourceMappingURL=children.service.js.map