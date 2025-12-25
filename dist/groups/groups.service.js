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
var GroupsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GroupsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const user_enum_1 = require("../common/enums/user.enum");
const notification_enum_1 = require("../common/enums/notification.enum");
const notifications_service_1 = require("../notifications/notifications.service");
const user_schema_1 = require("../schema/user.schema");
const child_profile_schema_1 = require("../schema/child-profile.schema");
const monitor_profile_schema_1 = require("../schema/monitor-profile.schema");
const reminder_schema_1 = require("../schema/reminder.schema");
const groups_util_1 = require("../common/utils/groups.util");
const app_config_service_1 = require("../config/app-config.service");
const age_group_util_1 = require("../common/utils/age-group.util");
const settings_service_1 = require("../settings/settings.service");
const recipients_resolver_service_1 = require("../common/services/recipients-resolver.service");
const timezone_util_1 = require("../common/utils/timezone.util");
const TZ = 'Africa/Douala';
let GroupsService = GroupsService_1 = class GroupsService {
    constructor(userModel, childProfileModel, monitorProfileModel, reminderModel, notificationService, config, settingsService, recipientsResolver) {
        this.userModel = userModel;
        this.childProfileModel = childProfileModel;
        this.monitorProfileModel = monitorProfileModel;
        this.reminderModel = reminderModel;
        this.notificationService = notificationService;
        this.config = config;
        this.settingsService = settingsService;
        this.recipientsResolver = recipientsResolver;
        this.logger = new common_1.Logger(GroupsService_1.name);
    }
    async getAgeToGroupMapping() {
        return this.settingsService.getAgeToGroupMapping();
    }
    async recomputeAllChildren(asOf = new Date()) {
        const mapping = await this.getAgeToGroupMapping();
        const dayKey = (0, groups_util_1.startOfDayKey)(asOf);
        const children = await this.userModel
            .find({
            role: user_enum_1.UserRole.Child,
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
            const ageYears = (0, groups_util_1.computeAgeYears)(new Date(child.dateOfBirth), asOf);
            const shouldArchive = ageYears >= 19;
            const profile = await this.childProfileModel
                .findOne({ userId: child._id })
                .lean()
                .exec();
            const currentGroup = profile?.currentGroup;
            const computedGroup = shouldArchive
                ? undefined
                : (0, age_group_util_1.computeGroupFromAge)(ageYears, mapping.bands);
            const needsGroupUpdate = !shouldArchive && computedGroup && computedGroup !== currentGroup;
            const justArchived = shouldArchive && child.lifecycleStatus !== user_enum_1.LifecycleStatus.Archived;
            if (needsGroupUpdate) {
                updatedGroups += 1;
                await this.childProfileModel.findOneAndUpdate({ userId: child._id }, {
                    $set: {
                        currentGroup: computedGroup,
                        groupComputedAt: asOf,
                    },
                }, { upsert: true });
            }
            else {
                await this.childProfileModel.findOneAndUpdate({ userId: child._id }, {
                    $set: {
                        groupComputedAt: asOf,
                    },
                }, { upsert: true });
            }
            const lastReminderKey = profile?.lastGroupChangeReminderAt
                ? (0, groups_util_1.startOfDayKey)(new Date(profile.lastGroupChangeReminderAt))
                : undefined;
            const canCreateReminderToday = lastReminderKey !== dayKey;
            if (canCreateReminderToday && (needsGroupUpdate || justArchived)) {
                remindersCreated += 1;
                await this.childProfileModel.findOneAndUpdate({ userId: child._id }, { $set: { lastGroupChangeReminderAt: asOf } }, { upsert: true });
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
                        lifecycleStatus: user_enum_1.LifecycleStatus.Archived,
                        archivedReason: 'turned_19',
                    },
                });
            }
        }
        return { processedChildren, updatedGroups, archivedAdults, remindersCreated };
    }
    async createAndSendGroupChangeReminder(params) {
        const recipients = await this.recipientsResolver.resolve('group_change', params.originTown);
        const message = params.newGroup === 'Adult'
            ? `Child "${params.childName}" has transitioned to Adult status (archived).`
            : `Child "${params.childName}" should move from group ${params.oldGroup ?? '-'} to ${params.newGroup ?? '-'}.`;
        const reminder = await this.reminderModel.create({
            kind: notification_enum_1.ReminderKind.GroupChange,
            message,
            channel: this.config.notificationProvider === 'whatsapp' ? 'whatsapp' : 'email',
            status: notification_enum_1.ReminderStatus.Active,
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
            const to = this.config.notificationProvider === 'whatsapp'
                ? recipient.phoneE164
                : recipient.email;
            if (!to) {
                continue;
            }
            const baseRedirect = this.config.frontendBaseUrl;
            const openProfileUrl = `${baseRedirect}/children/${params.childId}`;
            const expiresAt = (0, timezone_util_1.endOfDayInTimeZone)(new Date(), TZ);
            const actions = [
                { id: 'ACK', label: 'Acknowledge', redirectUrl: openProfileUrl },
                { id: 'OPEN_PROFILE', label: 'Open profile', redirectUrl: openProfileUrl },
            ];
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
                actions,
                conversation: {
                    state: 'group_change',
                    allowedResponses: actions.map((a) => a.id),
                    expiresAt,
                },
                contextType: notification_enum_1.NotificationContextType.GroupChange,
                contextId: String(reminder._id),
            });
        }
    }
};
exports.GroupsService = GroupsService;
exports.GroupsService = GroupsService = GroupsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __param(1, (0, mongoose_1.InjectModel)(child_profile_schema_1.ChildProfile.name)),
    __param(2, (0, mongoose_1.InjectModel)(monitor_profile_schema_1.MonitorProfile.name)),
    __param(3, (0, mongoose_1.InjectModel)(reminder_schema_1.Reminder.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        notifications_service_1.NotificationService,
        app_config_service_1.AppConfigService,
        settings_service_1.SettingsService,
        recipients_resolver_service_1.RecipientsResolverService])
], GroupsService);
//# sourceMappingURL=groups.service.js.map