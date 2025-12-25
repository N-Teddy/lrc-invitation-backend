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
var ActivitiesInvitesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActivitiesInvitesService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const activity_enum_1 = require("../common/enums/activity.enum");
const notification_enum_1 = require("../common/enums/notification.enum");
const user_enum_1 = require("../common/enums/user.enum");
const timezone_util_1 = require("../common/utils/timezone.util");
const app_config_service_1 = require("../config/app-config.service");
const job_runs_service_1 = require("../jobs/job-runs.service");
const notifications_service_1 = require("../notifications/notifications.service");
const activity_schema_1 = require("../schema/activity.schema");
const user_schema_1 = require("../schema/user.schema");
const recipients_resolver_service_1 = require("../common/services/recipients-resolver.service");
const activities_service_1 = require("./activities.service");
const timezone_util_2 = require("../common/utils/timezone.util");
const TZ = 'Africa/Douala';
let ActivitiesInvitesService = ActivitiesInvitesService_1 = class ActivitiesInvitesService {
    constructor(activityModel, userModel, activitiesService, notificationService, recipientsResolver, jobRuns, config) {
        this.activityModel = activityModel;
        this.userModel = userModel;
        this.activitiesService = activitiesService;
        this.notificationService = notificationService;
        this.recipientsResolver = recipientsResolver;
        this.jobRuns = jobRuns;
        this.config = config;
        this.logger = new common_1.Logger(ActivitiesInvitesService_1.name);
    }
    async runDaily(now = new Date()) {
        const targetDate = new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000);
        const targetParts = (0, timezone_util_1.getDatePartsInTimeZone)(targetDate, TZ);
        const dateKey = `${targetParts.year}-${String(targetParts.month).padStart(2, '0')}-${String(targetParts.day).padStart(2, '0')}`;
        const broadStart = new Date(targetDate.getTime() - 36 * 60 * 60 * 1000);
        const broadEnd = new Date(targetDate.getTime() + 36 * 60 * 60 * 1000);
        const activities = await this.activityModel
            .find({ startDate: { $gte: broadStart, $lt: broadEnd } })
            .lean()
            .exec();
        for (const activity of activities) {
            const startParts = (0, timezone_util_1.getDatePartsInTimeZone)(new Date(activity.startDate), TZ);
            if (startParts.year !== targetParts.year ||
                startParts.month !== targetParts.month ||
                startParts.day !== targetParts.day) {
                continue;
            }
            const runKey = `${String(activity._id)}:${dateKey}`;
            const shouldRun = await this.jobRuns.tryStart('activity_invites_3_weeks', runKey, {
                activityId: String(activity._id),
                dateKey,
            });
            if (!shouldRun)
                continue;
            await this.sendInviteSummary(activity);
        }
    }
    async sendInviteSummary(activity) {
        const isConference = activity.type === activity_enum_1.ActivityType.Conference;
        const kind = isConference ? 'conference_invites_3_weeks' : 'activity_invites_3_weeks';
        const town = isConference ? undefined : activity.town;
        const recipients = await this.recipientsResolver.resolve(kind, town);
        if (!recipients.length)
            return;
        const start = new Date(activity.startDate);
        const subject = `Invitations (3 weeks) — ${activity.type} — ${activity.town} — ${(0, timezone_util_1.formatMonthDayYear)(start, TZ)}`;
        const invitedChildrenCount = (activity.invitedChildrenUserIds ?? []).length;
        const invitedMonitorCount = (activity.invitedMonitorUserIds ?? []).length;
        const appUrl = `${this.config.frontendBaseUrl}/activities/${String(activity._id)}`;
        const expiresAt = (0, timezone_util_2.endOfDayInTimeZone)(start, TZ);
        let extraText = '';
        let extraHtml = '';
        if (isConference) {
            const systemUser = {
                role: user_enum_1.UserRole.Monitor,
                monitorLevel: user_enum_1.MonitorLevel.Super,
            };
            const eligibility = await this.activitiesService.getConferenceEligibility(String(activity._id), systemUser);
            const flaggedIds = (eligibility.flaggedChildren ?? []).map((x) => String(x.userId));
            const flaggedUsers = flaggedIds.length
                ? await this.userModel
                    .find({ _id: { $in: flaggedIds.map((id) => new mongoose_2.Types.ObjectId(id)) } })
                    .select({ _id: 1, fullName: 1, originTown: 1 })
                    .lean()
                    .exec()
                : [];
            const flaggedById = new Map(flaggedUsers.map((u) => [String(u._id), u]));
            const top = flaggedIds.slice(0, 15).map((id) => {
                const u = flaggedById.get(id);
                return u ? `${u.fullName} (${u.originTown ?? 'unknown'})` : id;
            });
            extraText =
                `\nEligibility highlight (non-blocking): ${eligibility.flaggedCount}/${eligibility.invitedCount} flagged\n` +
                    (top.length ? `Flagged (top ${top.length}):\n- ${top.join('\n- ')}` : '');
            extraHtml =
                `<p><strong>Eligibility highlight (non-blocking):</strong> ${eligibility.flaggedCount}/${eligibility.invitedCount} flagged</p>` +
                    (top.length
                        ? `<div style="margin-top:8px;"><strong>Flagged (top ${top.length}):</strong><div>${top
                            .map((x) => `- ${x}`)
                            .join('<br>')}</div></div>`
                        : '');
        }
        const text = `Activity: ${activity.type} (${activity.town})\n` +
            `Date: ${(0, timezone_util_1.formatMonthDayYear)(start, TZ)}\n` +
            `Targeting: ${activity.targetingCode}\n` +
            `Invited children: ${invitedChildrenCount}\n` +
            `Invited monitors: ${invitedMonitorCount}\n` +
            `Link: ${appUrl}\n` +
            extraText;
        const html = `<p><strong>Activity:</strong> ${activity.type} (${activity.town})</p>` +
            `<p><strong>Date:</strong> ${(0, timezone_util_1.formatMonthDayYear)(start, TZ)}</p>` +
            `<p><strong>Targeting:</strong> ${activity.targetingCode}</p>` +
            `<p><strong>Invited children:</strong> ${invitedChildrenCount}<br>` +
            `<strong>Invited monitors:</strong> ${invitedMonitorCount}</p>` +
            `<p><a href="${appUrl}" style="color:#93c5fd;">Open in app</a></p>` +
            extraHtml;
        for (const r of recipients) {
            const to = r.email ?? r.phoneE164;
            if (!to)
                continue;
            const actions = [{ id: 'DETAILS', label: 'View details', redirectUrl: appUrl }];
            await this.notificationService.send({
                userId: r.userId,
                to,
                subject,
                message: text,
                templateName: isConference ? 'conference-invite-list' : 'activity-invite-list',
                templateData: {
                    subject,
                    headline: subject,
                    bodyHtml: html,
                    appUrl,
                },
                actions,
                conversation: {
                    state: isConference ? 'conference_invites_3_weeks' : 'activity_invites_3_weeks',
                    allowedResponses: actions.map((a) => a.id),
                    expiresAt,
                },
                contextType: isConference
                    ? notification_enum_1.NotificationContextType.Conference
                    : notification_enum_1.NotificationContextType.Activity,
                contextId: `activity_invites_3_weeks:${String(activity._id)}`,
            });
        }
    }
};
exports.ActivitiesInvitesService = ActivitiesInvitesService;
exports.ActivitiesInvitesService = ActivitiesInvitesService = ActivitiesInvitesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(activity_schema_1.Activity.name)),
    __param(1, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        activities_service_1.ActivitiesService,
        notifications_service_1.NotificationService,
        recipients_resolver_service_1.RecipientsResolverService,
        job_runs_service_1.JobRunsService,
        app_config_service_1.AppConfigService])
], ActivitiesInvitesService);
//# sourceMappingURL=activities-invites.service.js.map