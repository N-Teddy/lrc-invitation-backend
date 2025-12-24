import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ActivityType, Town } from '../common/enums/activity.enum';
import { NotificationContextType } from '../common/enums/notification.enum';
import { MonitorLevel, UserRole } from '../common/enums/user.enum';
import { formatMonthDayYear, getDatePartsInTimeZone } from '../common/utils/timezone.util';
import { AppConfigService } from '../config/app-config.service';
import { JobRunsService } from '../jobs/job-runs.service';
import { NotificationService } from '../notifications/notifications.service';
import { Activity, ActivityDocument } from '../schema/activity.schema';
import { User, UserDocument } from '../schema/user.schema';
import { RecipientsResolverService } from '../common/services/recipients-resolver.service';
import { ActivitiesService } from './activities.service';
import { endOfDayInTimeZone } from '../common/utils/timezone.util';

const TZ = 'Africa/Douala';

@Injectable()
export class ActivitiesInvitesService {
    private readonly logger = new Logger(ActivitiesInvitesService.name);

    constructor(
        @InjectModel(Activity.name) private readonly activityModel: Model<ActivityDocument>,
        @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
        private readonly activitiesService: ActivitiesService,
        private readonly notificationService: NotificationService,
        private readonly recipientsResolver: RecipientsResolverService,
        private readonly jobRuns: JobRunsService,
        private readonly config: AppConfigService,
    ) {}

    async runDaily(now = new Date()) {
        const targetDate = new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000);
        const targetParts = getDatePartsInTimeZone(targetDate, TZ);
        const dateKey = `${targetParts.year}-${String(targetParts.month).padStart(2, '0')}-${String(
            targetParts.day,
        ).padStart(2, '0')}`;

        const broadStart = new Date(targetDate.getTime() - 36 * 60 * 60 * 1000);
        const broadEnd = new Date(targetDate.getTime() + 36 * 60 * 60 * 1000);

        const activities = await this.activityModel
            .find({ startDate: { $gte: broadStart, $lt: broadEnd } })
            .lean()
            .exec();

        for (const activity of activities) {
            const startParts = getDatePartsInTimeZone(new Date(activity.startDate), TZ);
            if (
                startParts.year !== targetParts.year ||
                startParts.month !== targetParts.month ||
                startParts.day !== targetParts.day
            ) {
                continue;
            }

            const runKey = `${String(activity._id)}:${dateKey}`;
            const shouldRun = await this.jobRuns.tryStart('activity_invites_3_weeks', runKey, {
                activityId: String(activity._id),
                dateKey,
            });
            if (!shouldRun) continue;

            await this.sendInviteSummary(activity);
        }
    }

    private async sendInviteSummary(activity: Record<string, any>) {
        const isConference = activity.type === ActivityType.Conference;
        const kind = isConference ? 'conference_invites_3_weeks' : 'activity_invites_3_weeks';
        const town = isConference ? undefined : (activity.town as Town | undefined);

        const recipients = await this.recipientsResolver.resolve(kind, town);
        if (!recipients.length) return;

        const start = new Date(activity.startDate);
        const subject = `Invitations (3 weeks) — ${activity.type} — ${activity.town} — ${formatMonthDayYear(
            start,
            TZ,
        )}`;

        const invitedChildrenCount = (activity.invitedChildrenUserIds ?? []).length;
        const invitedMonitorCount = (activity.invitedMonitorUserIds ?? []).length;
        const appUrl = `${this.config.frontendBaseUrl}/activities/${String(activity._id)}`;
        const expiresAt = endOfDayInTimeZone(start, TZ);

        let extraText = '';
        let extraHtml = '';

        if (isConference) {
            const systemUser = {
                role: UserRole.Monitor,
                monitorLevel: MonitorLevel.Super,
            };

            const eligibility = await this.activitiesService.getConferenceEligibility(
                String(activity._id),
                systemUser,
            );

            const flaggedIds = (eligibility.flaggedChildren ?? []).map((x: any) =>
                String(x.userId),
            );
            const flaggedUsers = flaggedIds.length
                ? await this.userModel
                      .find({ _id: { $in: flaggedIds.map((id) => new Types.ObjectId(id)) } })
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

        const text =
            `Activity: ${activity.type} (${activity.town})\n` +
            `Date: ${formatMonthDayYear(start, TZ)}\n` +
            `Targeting: ${activity.targetingCode}\n` +
            `Invited children: ${invitedChildrenCount}\n` +
            `Invited monitors: ${invitedMonitorCount}\n` +
            `Link: ${appUrl}\n` +
            extraText;

        const html =
            `<p><strong>Activity:</strong> ${activity.type} (${activity.town})</p>` +
            `<p><strong>Date:</strong> ${formatMonthDayYear(start, TZ)}</p>` +
            `<p><strong>Targeting:</strong> ${activity.targetingCode}</p>` +
            `<p><strong>Invited children:</strong> ${invitedChildrenCount}<br>` +
            `<strong>Invited monitors:</strong> ${invitedMonitorCount}</p>` +
            `<p><a href="${appUrl}" style="color:#93c5fd;">Open in app</a></p>` +
            extraHtml;

        for (const r of recipients) {
            const to = r.email ?? r.phoneE164;
            if (!to) continue;

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
                    ? NotificationContextType.Conference
                    : NotificationContextType.Activity,
                contextId: `activity_invites_3_weeks:${String(activity._id)}`,
            });
        }
    }
}
