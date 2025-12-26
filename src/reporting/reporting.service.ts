import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Activity, ActivityDocument } from '../schema/activity.schema';
import { Attendance, AttendanceDocument } from '../schema/attendance.schema';
import { User, UserDocument } from '../schema/user.schema';
import { ActivityType, Town } from '../common/enums/activity.enum';
import { AttendanceRoleAtTime } from '../common/enums/attendance.enum';
import { LifecycleStatus, MonitorLevel, UserRole } from '../common/enums/user.enum';
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

        const isSuper = currentUser?.monitorLevel === MonitorLevel.Super;
        if (!isSuper && activity.type === ActivityType.Conference) {
            const userTown = await this.townScopeService.resolveMonitorTown(currentUser);
            if (!userTown) throw new ForbiddenException('Monitor town not set');
            return this.getActivityAttendanceStats(activityId, { originTown: userTown });
        }

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

        const childrenPresent = childrenRow?.present ?? 0;
        const monitorsPresent = monitorRow?.present ?? 0;

        const eligible = await this.getEligibleTotalsForActivity(activity, scope);
        const childrenTotals = toTotals(
            childrenPresent,
            Math.max(eligible.childrenTotal, childrenPresent),
        );
        const monitorTotals = toTotals(
            monitorsPresent,
            Math.max(eligible.monitorsTotal, monitorsPresent),
        );

        const attendance = await this.attendanceModel
            .findOne({ activityId: new Types.ObjectId(activityId) })
            .select({ takenAt: 1, entries: 1, externalEntries: 1 })
            .lean()
            .exec();

        const rawExternalEntries = (attendance as any)?.externalEntries ?? [];
        const rawExternalCounts = (attendance as any)?.externalCounts ?? [];
        const scopedExternalEntries = scope?.originTown
            ? rawExternalEntries.filter(
                  (x: any) =>
                      ((x.scopeTown as Town | undefined) ?? (activity.town as Town)) ===
                      scope.originTown,
              )
            : rawExternalEntries;
        const scopedExternalCounts = scope?.originTown
            ? rawExternalCounts.filter(
                  (x: any) =>
                      ((x.scopeTown as Town | undefined) ?? (activity.town as Town)) ===
                      scope.originTown,
              )
            : rawExternalCounts;

        const externalPresentCount =
            scopedExternalEntries.length +
            scopedExternalCounts.reduce((sum: number, x: any) => sum + (Number(x?.count) || 0), 0);

        const classificationMap = new Map<string, number>();
        for (const row of out.byClassification ?? []) {
            classificationMap.set(
                String(row._id),
                (classificationMap.get(String(row._id)) ?? 0) + row.count,
            );
        }
        for (const x of scopedExternalEntries) {
            const key = String(x.classificationLabel ?? 'unclassified');
            classificationMap.set(key, (classificationMap.get(key) ?? 0) + 1);
        }
        for (const x of scopedExternalCounts) {
            const key = String(x.classificationLabel ?? 'unclassified');
            const count = Number(x?.count) || 0;
            if (!count) continue;
            classificationMap.set(key, (classificationMap.get(key) ?? 0) + count);
        }

        const originTownMap = new Map<string, number>();
        for (const row of out.byOriginTown ?? []) {
            originTownMap.set(
                String(row._id),
                (originTownMap.get(String(row._id)) ?? 0) + row.count,
            );
        }
        for (const x of scopedExternalEntries) {
            const townKey = String(
                (x.scopeTown as Town | undefined) ?? (activity.town as Town) ?? 'unknown',
            );
            originTownMap.set(townKey, (originTownMap.get(townKey) ?? 0) + 1);
        }
        for (const x of scopedExternalCounts) {
            const townKey = String(
                (x.scopeTown as Town | undefined) ?? (activity.town as Town) ?? 'unknown',
            );
            const count = Number(x?.count) || 0;
            if (!count) continue;
            originTownMap.set(townKey, (originTownMap.get(townKey) ?? 0) + count);
        }

        const overallPresentCount =
            (childrenTotals.present ?? 0) + (monitorTotals.present ?? 0) + externalPresentCount;

        const scopedEntriesForDonations = scope?.originTown
            ? ((attendance as any)?.entries ?? []).filter(
                  (e: any) => (e.originTownAtTime as Town | undefined) === scope.originTown,
              )
            : ((attendance as any)?.entries ?? []);

        const donationsEntriesTotal = scopedEntriesForDonations.reduce((sum: number, e: any) => {
            const amount = Number(e?.donationFcfa);
            if (!Number.isFinite(amount) || amount <= 0) return sum;
            return sum + Math.floor(amount);
        }, 0);

        const donationsExternalTotal = scopedExternalEntries.reduce((sum: number, x: any) => {
            const amount = Number(x?.donationFcfa);
            if (!Number.isFinite(amount) || amount <= 0) return sum;
            return sum + Math.floor(amount);
        }, 0);

        const donationsTotalFcfa = donationsEntriesTotal + donationsExternalTotal;

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
            externalPresentCount,
            overallPresentCount,
            donationsTotalFcfa,
            byOriginTown: normalizeCounts(
                [...originTownMap.entries()].map(([key, count]) => ({ key, count })),
            ),
            byClassificationLabel: normalizeCounts(
                [...classificationMap.entries()].map(([key, count]) => ({ key, count })),
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
        return this.getYearlyAttendanceSummary(year, { originTown: userTown });
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
        if (scope?.originTown) {
            activityQuery.$or = [
                { type: ActivityType.Conference },
                { town: scope.originTown, type: { $ne: ActivityType.Conference } },
            ];
        } else if (scope?.activityTown) {
            activityQuery.town = scope.activityTown;
        }

        const activities = await this.activityModel
            .find(activityQuery)
            .select({
                _id: 1,
                type: 1,
                town: 1,
                invitedChildrenUserIds: 1,
                invitedMonitorUserIds: 1,
            })
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
                externalPresentCount: 0,
                overallPresentCount: 0,
                donationsTotalFcfa: 0,
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

        const yearlyAttendanceDocs = await this.attendanceModel
            .find({ activityId: { $in: activityIds } })
            .select({ activityId: 1, entries: 1, externalEntries: 1 })
            .lean()
            .exec();

        const externalByClassification = new Map<string, number>();
        const externalByTown = new Map<string, number>();
        let externalPresentCount = 0;
        let donationsTotalFcfa = 0;

        for (const doc of yearlyAttendanceDocs) {
            const meta = activityById.get(String((doc as any).activityId));
            if (!meta) continue;

            const external = (doc as any).externalEntries ?? [];
            const entries = (doc as any).entries ?? [];
            const legacyCounts = (doc as any).externalCounts ?? [];
            for (const x of external) {
                const townKey = String((x.scopeTown as Town | undefined) ?? meta.town ?? 'unknown');
                if (scope?.originTown && (townKey as any) !== scope.originTown) continue;

                externalPresentCount += 1;
                externalByTown.set(townKey, (externalByTown.get(townKey) ?? 0) + 1);

                const labelKey = String(x.classificationLabel ?? 'unclassified');
                externalByClassification.set(
                    labelKey,
                    (externalByClassification.get(labelKey) ?? 0) + 1,
                );

                const donationAmount = Number(x?.donationFcfa);
                if (Number.isFinite(donationAmount) && donationAmount > 0) {
                    donationsTotalFcfa += Math.floor(donationAmount);
                }
            }

            for (const e of entries) {
                const entryTown = (e.originTownAtTime as Town | undefined) ?? meta.town;
                if (scope?.originTown && (entryTown as any) !== scope.originTown) continue;

                const donationAmount = Number(e?.donationFcfa);
                if (Number.isFinite(donationAmount) && donationAmount > 0) {
                    donationsTotalFcfa += Math.floor(donationAmount);
                }
            }

            for (const x of legacyCounts) {
                const count = Number(x?.count) || 0;
                if (!count) continue;
                const townKey = String((x.scopeTown as Town | undefined) ?? meta.town ?? 'unknown');
                if (scope?.originTown && (townKey as any) !== scope.originTown) continue;

                externalPresentCount += count;
                externalByTown.set(townKey, (externalByTown.get(townKey) ?? 0) + count);

                const labelKey = String(x.classificationLabel ?? 'unclassified');
                externalByClassification.set(
                    labelKey,
                    (externalByClassification.get(labelKey) ?? 0) + count,
                );
            }
        }

        const eligible = await this.getEligibleTotalsForYear(activities, scope);
        const childrenPresent = childrenRow?.present ?? 0;
        const monitorsPresent = monitorRow?.present ?? 0;
        const childrenTotals = toTotals(
            childrenPresent,
            Math.max(eligible.childrenTotal, childrenPresent),
        );
        const monitorTotals = toTotals(
            monitorsPresent,
            Math.max(eligible.monitorsTotal, monitorsPresent),
        );
        const overallPresentCount =
            (childrenTotals.present ?? 0) + (monitorTotals.present ?? 0) + externalPresentCount;

        const classificationMap = new Map<string, number>();
        for (const row of out.byClassification ?? []) {
            classificationMap.set(
                String(row._id),
                (classificationMap.get(String(row._id)) ?? 0) + row.count,
            );
        }
        for (const [key, count] of externalByClassification.entries()) {
            classificationMap.set(key, (classificationMap.get(key) ?? 0) + count);
        }

        const townMap = new Map<string, number>();
        for (const row of out.byTown ?? []) {
            townMap.set(String(row._id), (townMap.get(String(row._id)) ?? 0) + row.count);
        }
        for (const [key, count] of externalByTown.entries()) {
            townMap.set(key, (townMap.get(key) ?? 0) + count);
        }

        return {
            year,
            totalsByRole: {
                children: childrenTotals,
                monitors: monitorTotals,
            },
            externalPresentCount,
            overallPresentCount,
            donationsTotalFcfa,
            byTown: normalizeCounts([...townMap.entries()].map(([key, count]) => ({ key, count }))),
            byActivityType: normalizeCounts(
                [...byActivityTypeCounts.entries()].map(([key, count]) => ({ key, count })),
            ),
            byClassificationLabel: normalizeCounts(
                [...classificationMap.entries()].map(([key, count]) => ({ key, count })),
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
        const baseRedirect = this.config.frontendBaseUrl;
        const detailsUrl = `${baseRedirect}/reports?mode=activity&activityId=${activityId}`;
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

    private async getEligibleTotalsForActivity(
        activity: Record<string, any>,
        scope?: { originTown?: Town },
    ): Promise<{ childrenTotal: number; monitorsTotal: number }> {
        const invitedChildrenTotal = (activity.invitedChildrenUserIds ?? []).length;
        const invitedMonitorsTotal = (activity.invitedMonitorUserIds ?? []).length;
        if (!scope?.originTown) {
            return { childrenTotal: invitedChildrenTotal, monitorsTotal: invitedMonitorsTotal };
        }

        const town = scope.originTown;
        if (activity.type !== ActivityType.Conference) {
            if ((activity.town as Town | undefined) !== town) {
                return { childrenTotal: 0, monitorsTotal: 0 };
            }
            return { childrenTotal: invitedChildrenTotal, monitorsTotal: invitedMonitorsTotal };
        }

        const invitedChildIds: Types.ObjectId[] = (activity.invitedChildrenUserIds ?? []).map(
            (x: any) => (typeof x === 'string' ? new Types.ObjectId(x) : (x as Types.ObjectId)),
        );

        const childrenTotal = invitedChildIds.length
            ? await this.userModel
                  .countDocuments({
                      _id: { $in: invitedChildIds },
                      role: UserRole.Child,
                      originTown: town,
                  })
                  .exec()
            : 0;

        const monitorsTotal = await this.userModel
            .countDocuments({
                role: UserRole.Monitor,
                lifecycleStatus: LifecycleStatus.Active,
                originTown: town,
            })
            .exec();

        return { childrenTotal, monitorsTotal };
    }

    private async getEligibleTotalsForYear(
        activities: Array<Record<string, any>>,
        scope?: { activityTown?: Town; originTown?: Town },
    ): Promise<{ childrenTotal: number; monitorsTotal: number }> {
        if (!scope?.originTown) {
            return {
                childrenTotal: activities.reduce(
                    (sum, a) => sum + ((a.invitedChildrenUserIds ?? []).length || 0),
                    0,
                ),
                monitorsTotal: activities.reduce(
                    (sum, a) => sum + ((a.invitedMonitorUserIds ?? []).length || 0),
                    0,
                ),
            };
        }

        const town = scope.originTown;
        const monitorsTotalInTown = await this.userModel
            .countDocuments({
                role: UserRole.Monitor,
                lifecycleStatus: LifecycleStatus.Active,
                originTown: town,
            })
            .exec();

        let childrenTotal = 0;
        let monitorsTotal = 0;

        for (const a of activities) {
            if (a.type === ActivityType.Conference) {
                const invitedChildIds: Types.ObjectId[] = (a.invitedChildrenUserIds ?? []).map(
                    (x: any) =>
                        typeof x === 'string' ? new Types.ObjectId(x) : (x as Types.ObjectId),
                );
                if (invitedChildIds.length) {
                    childrenTotal += await this.userModel
                        .countDocuments({
                            _id: { $in: invitedChildIds },
                            role: UserRole.Child,
                            originTown: town,
                        })
                        .exec();
                }
                monitorsTotal += monitorsTotalInTown;
                continue;
            }

            if ((a.town as Town | undefined) !== town) continue;
            childrenTotal += (a.invitedChildrenUserIds ?? []).length || 0;
            monitorsTotal += (a.invitedMonitorUserIds ?? []).length || 0;
        }

        return { childrenTotal, monitorsTotal };
    }
}
