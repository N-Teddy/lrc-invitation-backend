import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Activity, ActivityDocument } from '../schema/activity.schema';
import { Attendance, AttendanceDocument } from '../schema/attendance.schema';
import { User, UserDocument } from '../schema/user.schema';
import { ActivityType, Town } from '../common/enums/activity.enum';
import { AttendanceRoleAtTime } from '../common/enums/attendance.enum';
import { MonitorLevel, UserRole } from '../common/enums/user.enum';
import { NotificationService } from '../notifications/notifications.service';
import { NotificationContextType } from '../common/enums/notification.enum';
import { TownScopeService } from '../common/services/town-scope.service';
import { JobRunsService } from '../jobs/job-runs.service';
import { RecipientsResolverService } from '../common/services/recipients-resolver.service';
import {
    endOfDayInTimeZone,
    formatMonthDayYear,
    getDatePartsInTimeZone,
} from '../common/utils/timezone.util';
import { AppConfigService } from '../config/app-config.service';

type Totals = { present: number; absent: number; total: number };

function toTotals(present: number, total: number): Totals {
    return { present, total, absent: Math.max(0, total - present) };
}

function normalizeCounts(items: Array<{ key: string; count: number }>) {
    return items
        .filter((x) => x.key)
        .sort((a, b) => a.key.localeCompare(b.key))
        .map((x) => ({ key: x.key, count: x.count }));
}

@Injectable()
export class ReportingService {
    constructor(
        @InjectModel(Activity.name) private readonly activityModel: Model<ActivityDocument>,
        @InjectModel(Attendance.name)
        private readonly attendanceModel: Model<AttendanceDocument>,
        @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
        private readonly notificationService: NotificationService,
        private readonly townScopeService: TownScopeService,
        private readonly recipientsResolver: RecipientsResolverService,
        private readonly jobRuns: JobRunsService,
        private readonly config: AppConfigService,
    ) {}

    async sendTurning19YearlyReport(now = new Date()) {
        const tz = 'Africa/Douala';
        const parts = getDatePartsInTimeZone(now, tz);
        if (parts.month !== 1 || parts.day !== 1) return;

        const runKey = String(parts.year);
        const shouldRun = await this.jobRuns.tryStart('turning_19_yearly', runKey, {
            timeZone: tz,
        });
        if (!shouldRun) return;

        const report = await this.getTurning19Report(parts.year);
        const byTown = new Map<string, Array<{ fullName: string; dateOfBirth?: Date }>>();
        for (const c of report.children ?? []) {
            const townKey = (c.originTown as string | undefined) ?? 'unknown';
            byTown.set(townKey, [
                ...(byTown.get(townKey) ?? []),
                { fullName: c.fullName, dateOfBirth: c.dateOfBirth },
            ]);
        }

        const towns = [...byTown.keys()].sort((a, b) => a.localeCompare(b));
        const lines: string[] = [];
        const htmlLines: string[] = [];
        lines.push(`Turning 19 in ${parts.year}: ${report.count}`);
        htmlLines.push(`<p><strong>Turning 19 in ${parts.year}:</strong> ${report.count}</p>`);

        for (const town of towns) {
            const list = (byTown.get(town) ?? []).slice().sort((a, b) => {
                const ad = a.dateOfBirth ? new Date(a.dateOfBirth).getTime() : 0;
                const bd = b.dateOfBirth ? new Date(b.dateOfBirth).getTime() : 0;
                return ad - bd;
            });

            lines.push(`\n${town.toUpperCase()}:`);
            htmlLines.push(`<h3 style="margin:16px 0 8px;">${town.toUpperCase()}</h3>`);
            for (const p of list) {
                const dob = p.dateOfBirth ? formatMonthDayYear(new Date(p.dateOfBirth), tz) : '-';
                lines.push(`- ${p.fullName} — ${dob}`);
                htmlLines.push(`<div>- ${p.fullName} — ${dob}</div>`);
            }
        }

        const subject = `Yearly turning-19 report — ${parts.year}`;
        const recipients = await this.recipientsResolver.resolve('turning_19_yearly');

        for (const r of recipients) {
            const to = r.email ?? r.phoneE164;
            if (!to) continue;
            await this.notificationService.send({
                userId: r.userId,
                to,
                subject,
                message: lines.join('\n').trim(),
                templateName: 'turning-19-report',
                templateData: {
                    subject,
                    headline: subject,
                    bodyHtml: htmlLines.join('\n'),
                },
                contextType: NotificationContextType.Transition,
                contextId: `turning_19_yearly:${parts.year}`,
            });
        }
    }

    async getActivityAttendanceStatsForUser(activityId: string, currentUser: Record<string, any>) {
        const activity = await this.activityModel.findById(activityId).lean().exec();
        if (!activity) throw new NotFoundException('Activity not found');
        await this.assertCanReadActivityReports(activity, currentUser);
        return this.getActivityAttendanceStats(activityId);
    }

    async getActivityAttendanceStats(activityId: string, scope?: { originTown?: Town }) {
        const activity = await this.activityModel.findById(activityId).lean().exec();
        if (!activity) throw new NotFoundException('Activity not found');

        const matchEntry: Record<string, any> = {};
        if (scope?.originTown) {
            matchEntry['entries.originTownAtTime'] = scope.originTown;
        }

        const pipeline: any[] = [
            { $match: { activityId: new Types.ObjectId(activityId) } },
            { $unwind: '$entries' },
        ];
        if (Object.keys(matchEntry).length) {
            pipeline.push({ $match: matchEntry });
        }

        pipeline.push(
            {
                $project: {
                    present: '$entries.present',
                    roleAtTime: '$entries.roleAtTime',
                    originTownAtTime: '$entries.originTownAtTime',
                    groupAtTime: '$entries.groupAtTime',
                    classificationLabel: '$entries.classificationLabel',
                },
            },
            {
                $facet: {
                    totals: [
                        {
                            $group: {
                                _id: '$roleAtTime',
                                total: { $sum: 1 },
                                present: {
                                    $sum: {
                                        $cond: [{ $eq: ['$present', true] }, 1, 0],
                                    },
                                },
                            },
                        },
                    ],
                    byOriginTown: [
                        {
                            $group: {
                                _id: { $ifNull: ['$originTownAtTime', 'unknown'] },
                                count: { $sum: 1 },
                            },
                        },
                    ],
                    byClassification: [
                        {
                            $group: {
                                _id: { $ifNull: ['$classificationLabel', 'unclassified'] },
                                count: { $sum: 1 },
                            },
                        },
                    ],
                    byChildGroup: [
                        { $match: { roleAtTime: AttendanceRoleAtTime.Child } },
                        {
                            $group: {
                                _id: { $ifNull: ['$groupAtTime', 'unknown'] },
                                count: { $sum: 1 },
                            },
                        },
                    ],
                },
            },
        );

        const agg = await this.attendanceModel.aggregate(pipeline).exec();
        const out = agg?.[0] ?? {};

        const totalsRows: Array<{ _id: string; total: number; present: number }> = out.totals ?? [];
        const childrenRow = totalsRows.find((r) => r._id === AttendanceRoleAtTime.Child);
        const monitorRow = totalsRows.find((r) => r._id === AttendanceRoleAtTime.Monitor);

        const childrenTotals = toTotals(childrenRow?.present ?? 0, childrenRow?.total ?? 0);
        const monitorTotals = toTotals(monitorRow?.present ?? 0, monitorRow?.total ?? 0);

        const attendance = await this.attendanceModel
            .findOne({ activityId: new Types.ObjectId(activityId) })
            .select({ takenAt: 1 })
            .lean()
            .exec();

        return {
            activityId,
            activityType: activity.type as ActivityType,
            activityTown: activity.town as Town,
            startDate: new Date(activity.startDate),
            endDate: new Date(activity.endDate),
            takenAt: attendance?.takenAt,
            totalsByRole: {
                children: childrenTotals,
                monitors: monitorTotals,
            },
            byOriginTown: normalizeCounts(
                (out.byOriginTown ?? []).map((x: any) => ({ key: String(x._id), count: x.count })),
            ),
            byClassificationLabel: normalizeCounts(
                (out.byClassification ?? []).map((x: any) => ({
                    key: String(x._id),
                    count: x.count,
                })),
            ),
            byChildGroup: normalizeCounts(
                (out.byChildGroup ?? []).map((x: any) => ({ key: String(x._id), count: x.count })),
            ),
        };
    }

    async getYearlyAttendanceSummaryForUser(year: number, currentUser: Record<string, any>) {
        if (currentUser?.role !== UserRole.Monitor) {
            throw new ForbiddenException('Only monitors can view reports');
        }
        if (currentUser?.monitorLevel === MonitorLevel.Super) {
            return this.getYearlyAttendanceSummary(year);
        }

        const userTown = await this.townScopeService.resolveMonitorTown(currentUser);
        if (!userTown) throw new ForbiddenException('Monitor town not set');

        const start = new Date(Date.UTC(year, 0, 1, 0, 0, 0));
        const end = new Date(Date.UTC(year + 1, 0, 1, 0, 0, 0));

        const activities = await this.activityModel
            .find({
                startDate: { $gte: start, $lt: end },
                $or: [
                    { type: ActivityType.Conference },
                    { town: userTown, type: { $ne: ActivityType.Conference } },
                ],
            })
            .select({ _id: 1, type: 1, town: 1 })
            .lean()
            .exec();

        const activityIds = activities.map((a) => a._id);
        const activityById = new Map<string, { type: ActivityType; town: Town }>();
        for (const a of activities) {
            activityById.set(String(a._id), {
                type: a.type as ActivityType,
                town: a.town as Town,
            });
        }

        if (!activityIds.length) {
            return {
                year,
                totalsByRole: {
                    children: toTotals(0, 0),
                    monitors: toTotals(0, 0),
                },
                byTown: [],
                byActivityType: [],
                byClassificationLabel: [],
                byChildGroup: [],
            };
        }

        const pipeline: any[] = [
            { $match: { activityId: { $in: activityIds } } },
            { $unwind: '$entries' },
            {
                $project: {
                    activityId: '$activityId',
                    present: '$entries.present',
                    roleAtTime: '$entries.roleAtTime',
                    originTownAtTime: '$entries.originTownAtTime',
                    groupAtTime: '$entries.groupAtTime',
                    classificationLabel: '$entries.classificationLabel',
                },
            },
            {
                $addFields: {
                    activityIdStr: { $toString: '$activityId' },
                },
            },
            {
                $facet: {
                    totals: [
                        {
                            $group: {
                                _id: '$roleAtTime',
                                total: { $sum: 1 },
                                present: {
                                    $sum: {
                                        $cond: [{ $eq: ['$present', true] }, 1, 0],
                                    },
                                },
                            },
                        },
                    ],
                    byTown: [
                        {
                            $group: {
                                _id: { $ifNull: ['$originTownAtTime', 'unknown'] },
                                count: { $sum: 1 },
                            },
                        },
                    ],
                    byClassification: [
                        {
                            $group: {
                                _id: { $ifNull: ['$classificationLabel', 'unclassified'] },
                                count: { $sum: 1 },
                            },
                        },
                    ],
                    byChildGroup: [
                        { $match: { roleAtTime: AttendanceRoleAtTime.Child } },
                        {
                            $group: {
                                _id: { $ifNull: ['$groupAtTime', 'unknown'] },
                                count: { $sum: 1 },
                            },
                        },
                    ],
                    byActivityType: [
                        {
                            $group: {
                                _id: '$activityIdStr',
                                count: { $sum: 1 },
                            },
                        },
                    ],
                },
            },
        ];

        const agg = await this.attendanceModel.aggregate(pipeline).exec();
        const out = agg?.[0] ?? {};

        const totalsRows: Array<{ _id: string; total: number; present: number }> = out.totals ?? [];
        const childrenRow = totalsRows.find((r) => r._id === AttendanceRoleAtTime.Child);
        const monitorRow = totalsRows.find((r) => r._id === AttendanceRoleAtTime.Monitor);

        const byActivityTypeCounts = new Map<ActivityType, number>();
        for (const row of out.byActivityType ?? []) {
            const meta = activityById.get(String(row._id));
            if (!meta) continue;
            byActivityTypeCounts.set(
                meta.type,
                (byActivityTypeCounts.get(meta.type) ?? 0) + row.count,
            );
        }

        return {
            year,
            totalsByRole: {
                children: toTotals(childrenRow?.present ?? 0, childrenRow?.total ?? 0),
                monitors: toTotals(monitorRow?.present ?? 0, monitorRow?.total ?? 0),
            },
            byTown: normalizeCounts(
                (out.byTown ?? []).map((x: any) => ({ key: String(x._id), count: x.count })),
            ),
            byActivityType: normalizeCounts(
                [...byActivityTypeCounts.entries()].map(([key, count]) => ({ key, count })),
            ),
            byClassificationLabel: normalizeCounts(
                (out.byClassification ?? []).map((x: any) => ({
                    key: String(x._id),
                    count: x.count,
                })),
            ),
            byChildGroup: normalizeCounts(
                (out.byChildGroup ?? []).map((x: any) => ({ key: String(x._id), count: x.count })),
            ),
        };
    }

    async getYearlyAttendanceSummary(
        year: number,
        scope?: { activityTown?: Town; originTown?: Town },
    ) {
        const start = new Date(Date.UTC(year, 0, 1, 0, 0, 0));
        const end = new Date(Date.UTC(year + 1, 0, 1, 0, 0, 0));

        const activityQuery: Record<string, any> = {
            startDate: { $gte: start, $lt: end },
        };
        if (scope?.activityTown) {
            activityQuery.town = scope.activityTown;
        }

        const activities = await this.activityModel
            .find(activityQuery)
            .select({ _id: 1, type: 1, town: 1 })
            .lean()
            .exec();
        const activityIds = activities.map((a) => a._id);
        const activityById = new Map<string, { type: ActivityType; town: Town }>();
        for (const a of activities) {
            activityById.set(String(a._id), {
                type: a.type as ActivityType,
                town: a.town as Town,
            });
        }

        if (!activityIds.length) {
            return {
                year,
                totalsByRole: {
                    children: toTotals(0, 0),
                    monitors: toTotals(0, 0),
                },
                byTown: [],
                byActivityType: [],
                byClassificationLabel: [],
                byChildGroup: [],
            };
        }

        const match: Record<string, any> = {
            activityId: { $in: activityIds },
        };

        const entryMatch: Record<string, any> = {};
        if (scope?.originTown) {
            entryMatch['entries.originTownAtTime'] = scope.originTown;
        }

        const pipeline: any[] = [{ $match: match }, { $unwind: '$entries' }];
        if (Object.keys(entryMatch).length) {
            pipeline.push({ $match: entryMatch });
        }

        pipeline.push(
            {
                $project: {
                    activityId: '$activityId',
                    present: '$entries.present',
                    roleAtTime: '$entries.roleAtTime',
                    originTownAtTime: '$entries.originTownAtTime',
                    groupAtTime: '$entries.groupAtTime',
                    classificationLabel: '$entries.classificationLabel',
                },
            },
            {
                $addFields: {
                    activityIdStr: { $toString: '$activityId' },
                },
            },
            {
                $facet: {
                    totals: [
                        {
                            $group: {
                                _id: '$roleAtTime',
                                total: { $sum: 1 },
                                present: {
                                    $sum: {
                                        $cond: [{ $eq: ['$present', true] }, 1, 0],
                                    },
                                },
                            },
                        },
                    ],
                    byTown: [
                        {
                            $group: {
                                _id: { $ifNull: ['$originTownAtTime', 'unknown'] },
                                count: { $sum: 1 },
                            },
                        },
                    ],
                    byClassification: [
                        {
                            $group: {
                                _id: { $ifNull: ['$classificationLabel', 'unclassified'] },
                                count: { $sum: 1 },
                            },
                        },
                    ],
                    byChildGroup: [
                        { $match: { roleAtTime: AttendanceRoleAtTime.Child } },
                        {
                            $group: {
                                _id: { $ifNull: ['$groupAtTime', 'unknown'] },
                                count: { $sum: 1 },
                            },
                        },
                    ],
                    byActivityType: [
                        {
                            $group: {
                                _id: '$activityIdStr',
                                count: { $sum: 1 },
                            },
                        },
                    ],
                },
            },
        );

        const agg = await this.attendanceModel.aggregate(pipeline).exec();
        const out = agg?.[0] ?? {};

        const totalsRows: Array<{ _id: string; total: number; present: number }> = out.totals ?? [];
        const childrenRow = totalsRows.find((r) => r._id === AttendanceRoleAtTime.Child);
        const monitorRow = totalsRows.find((r) => r._id === AttendanceRoleAtTime.Monitor);

        const byActivityTypeCounts = new Map<ActivityType, number>();
        for (const row of out.byActivityType ?? []) {
            const meta = activityById.get(String(row._id));
            if (!meta) continue;
            byActivityTypeCounts.set(
                meta.type,
                (byActivityTypeCounts.get(meta.type) ?? 0) + row.count,
            );
        }

        return {
            year,
            totalsByRole: {
                children: toTotals(childrenRow?.present ?? 0, childrenRow?.total ?? 0),
                monitors: toTotals(monitorRow?.present ?? 0, monitorRow?.total ?? 0),
            },
            byTown: normalizeCounts(
                (out.byTown ?? []).map((x: any) => ({ key: String(x._id), count: x.count })),
            ),
            byActivityType: normalizeCounts(
                [...byActivityTypeCounts.entries()].map(([key, count]) => ({ key, count })),
            ),
            byClassificationLabel: normalizeCounts(
                (out.byClassification ?? []).map((x: any) => ({
                    key: String(x._id),
                    count: x.count,
                })),
            ),
            byChildGroup: normalizeCounts(
                (out.byChildGroup ?? []).map((x: any) => ({ key: String(x._id), count: x.count })),
            ),
        };
    }

    async getTurning19Report(year: number, scope?: { originTown?: Town }) {
        const start = new Date(Date.UTC(year - 19, 0, 1, 0, 0, 0));
        const end = new Date(Date.UTC(year - 19 + 1, 0, 1, 0, 0, 0));

        const query: Record<string, any> = {
            role: UserRole.Child,
            dateOfBirth: { $gte: start, $lt: end },
        };
        if (scope?.originTown) {
            query.originTown = scope.originTown;
        }

        const children = await this.userModel
            .find(query)
            .select({ _id: 1, fullName: 1, dateOfBirth: 1, originTown: 1 })
            .lean()
            .exec();

        return {
            year,
            count: children.length,
            children: children.map((c) => ({
                userId: String(c._id),
                fullName: c.fullName,
                dateOfBirth: c.dateOfBirth ? new Date(c.dateOfBirth) : undefined,
                originTown: c.originTown,
            })),
        };
    }

    async notifySuperMonitorsAfterAttendance(activityId: string) {
        const stats = await this.getActivityAttendanceStats(activityId);

        const supers = await this.userModel
            .find({ role: UserRole.Monitor, monitorLevel: MonitorLevel.Super })
            .select({ _id: 1, email: 1 })
            .lean()
            .exec();

        const subject = 'Post-activity attendance stats';
        const baseRedirect = this.config.appBaseUrl.replace(/\/$/, '');
        const detailsUrl = `${baseRedirect}/reports/activities/${activityId}/attendance-stats`;
        const expiresAt = endOfDayInTimeZone(new Date(), 'Africa/Douala');
        const message =
            `Activity ${stats.activityType} (${stats.activityTown})\\n` +
            `Children: ${stats.totalsByRole.children.present}/${stats.totalsByRole.children.total} present\\n` +
            `Monitors: ${stats.totalsByRole.monitors.present}/${stats.totalsByRole.monitors.total} present\\n` +
            `By town: ${stats.byOriginTown.map((x) => `${x.key}:${x.count}`).join(', ') || '-'}\\n` +
            `By classification: ${stats.byClassificationLabel.map((x) => `${x.key}:${x.count}`).join(', ') || '-'}`;

        for (const superUser of supers) {
            if (!superUser.email) continue;
            await this.notificationService.send({
                userId: String(superUser._id),
                to: superUser.email,
                subject,
                message,
                templateName: 'generic-notification',
                templateData: {
                    subject,
                    headline: subject,
                    message,
                },
                actions: [{ id: 'DETAILS', label: 'View details', redirectUrl: detailsUrl }],
                conversation: {
                    state: 'attendance_report',
                    allowedResponses: ['DETAILS'],
                    expiresAt,
                },
                contextType: NotificationContextType.AttendanceReport,
                contextId: String(activityId),
            });
        }
    }

    private async assertCanReadActivityReports(
        activity: Record<string, any>,
        currentUser: Record<string, any>,
    ) {
        if (currentUser?.role !== UserRole.Monitor) {
            throw new ForbiddenException('Only monitors can view reports');
        }
        if (currentUser?.monitorLevel === MonitorLevel.Super) return;
        if (activity.type === ActivityType.Conference) return;

        const userTown = await this.townScopeService.resolveMonitorTown(currentUser);
        if (!userTown) throw new ForbiddenException('Monitor town not set');
        if ((activity.town as Town | undefined) !== userTown) {
            throw new ForbiddenException('Not allowed to view other towns');
        }
    }
}
