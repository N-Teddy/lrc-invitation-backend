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
exports.ReportingService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const activity_schema_1 = require("../schema/activity.schema");
const attendance_schema_1 = require("../schema/attendance.schema");
const user_schema_1 = require("../schema/user.schema");
const activity_enum_1 = require("../common/enums/activity.enum");
const attendance_enum_1 = require("../common/enums/attendance.enum");
const user_enum_1 = require("../common/enums/user.enum");
const notifications_service_1 = require("../notifications/notifications.service");
const notification_enum_1 = require("../common/enums/notification.enum");
const town_scope_service_1 = require("../common/services/town-scope.service");
const job_runs_service_1 = require("../jobs/job-runs.service");
const recipients_resolver_service_1 = require("../common/services/recipients-resolver.service");
const timezone_util_1 = require("../common/utils/timezone.util");
const app_config_service_1 = require("../config/app-config.service");
function toTotals(present, total) {
    return { present, total, absent: Math.max(0, total - present) };
}
function normalizeCounts(items) {
    return items
        .filter((x) => x.key)
        .sort((a, b) => a.key.localeCompare(b.key))
        .map((x) => ({ key: x.key, count: x.count }));
}
let ReportingService = class ReportingService {
    constructor(activityModel, attendanceModel, userModel, notificationService, townScopeService, recipientsResolver, jobRuns, config) {
        this.activityModel = activityModel;
        this.attendanceModel = attendanceModel;
        this.userModel = userModel;
        this.notificationService = notificationService;
        this.townScopeService = townScopeService;
        this.recipientsResolver = recipientsResolver;
        this.jobRuns = jobRuns;
        this.config = config;
    }
    async sendTurning19YearlyReport(now = new Date()) {
        const tz = 'Africa/Douala';
        const parts = (0, timezone_util_1.getDatePartsInTimeZone)(now, tz);
        if (parts.month !== 1 || parts.day !== 1)
            return;
        const runKey = String(parts.year);
        const shouldRun = await this.jobRuns.tryStart('turning_19_yearly', runKey, {
            timeZone: tz,
        });
        if (!shouldRun)
            return;
        const report = await this.getTurning19Report(parts.year);
        const byTown = new Map();
        for (const c of report.children ?? []) {
            const townKey = c.originTown ?? 'unknown';
            byTown.set(townKey, [
                ...(byTown.get(townKey) ?? []),
                { fullName: c.fullName, dateOfBirth: c.dateOfBirth },
            ]);
        }
        const towns = [...byTown.keys()].sort((a, b) => a.localeCompare(b));
        const lines = [];
        const htmlLines = [];
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
                const dob = p.dateOfBirth ? (0, timezone_util_1.formatMonthDayYear)(new Date(p.dateOfBirth), tz) : '-';
                lines.push(`- ${p.fullName} — ${dob}`);
                htmlLines.push(`<div>- ${p.fullName} — ${dob}</div>`);
            }
        }
        const subject = `Yearly turning-19 report — ${parts.year}`;
        const recipients = await this.recipientsResolver.resolve('turning_19_yearly');
        for (const r of recipients) {
            const to = r.email ?? r.phoneE164;
            if (!to)
                continue;
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
                contextType: notification_enum_1.NotificationContextType.Transition,
                contextId: `turning_19_yearly:${parts.year}`,
            });
        }
    }
    async getActivityAttendanceStatsForUser(activityId, currentUser) {
        const activity = await this.activityModel.findById(activityId).lean().exec();
        if (!activity)
            throw new common_1.NotFoundException('Activity not found');
        await this.assertCanReadActivityReports(activity, currentUser);
        const isSuper = currentUser?.monitorLevel === user_enum_1.MonitorLevel.Super;
        if (!isSuper && activity.type === activity_enum_1.ActivityType.Conference) {
            const userTown = await this.townScopeService.resolveMonitorTown(currentUser);
            if (!userTown)
                throw new common_1.ForbiddenException('Monitor town not set');
            return this.getActivityAttendanceStats(activityId, { originTown: userTown });
        }
        return this.getActivityAttendanceStats(activityId);
    }
    async getActivityAttendanceStats(activityId, scope) {
        const activity = await this.activityModel.findById(activityId).lean().exec();
        if (!activity)
            throw new common_1.NotFoundException('Activity not found');
        const matchEntry = {};
        if (scope?.originTown) {
            matchEntry['entries.originTownAtTime'] = scope.originTown;
        }
        const pipeline = [
            { $match: { activityId: new mongoose_2.Types.ObjectId(activityId) } },
            { $unwind: '$entries' },
        ];
        if (Object.keys(matchEntry).length) {
            pipeline.push({ $match: matchEntry });
        }
        pipeline.push({
            $project: {
                present: '$entries.present',
                roleAtTime: '$entries.roleAtTime',
                originTownAtTime: '$entries.originTownAtTime',
                groupAtTime: '$entries.groupAtTime',
                classificationLabel: '$entries.classificationLabel',
            },
        }, {
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
                    { $match: { roleAtTime: attendance_enum_1.AttendanceRoleAtTime.Child } },
                    {
                        $group: {
                            _id: { $ifNull: ['$groupAtTime', 'unknown'] },
                            count: { $sum: 1 },
                        },
                    },
                ],
            },
        });
        const agg = await this.attendanceModel.aggregate(pipeline).exec();
        const out = agg?.[0] ?? {};
        const totalsRows = out.totals ?? [];
        const childrenRow = totalsRows.find((r) => r._id === attendance_enum_1.AttendanceRoleAtTime.Child);
        const monitorRow = totalsRows.find((r) => r._id === attendance_enum_1.AttendanceRoleAtTime.Monitor);
        const childrenPresent = childrenRow?.present ?? 0;
        const monitorsPresent = monitorRow?.present ?? 0;
        const eligible = await this.getEligibleTotalsForActivity(activity, scope);
        const childrenTotals = toTotals(childrenPresent, Math.max(eligible.childrenTotal, childrenPresent));
        const monitorTotals = toTotals(monitorsPresent, Math.max(eligible.monitorsTotal, monitorsPresent));
        const attendance = await this.attendanceModel
            .findOne({ activityId: new mongoose_2.Types.ObjectId(activityId) })
            .select({ takenAt: 1, externalEntries: 1 })
            .lean()
            .exec();
        const rawExternalEntries = attendance?.externalEntries ?? [];
        const rawExternalCounts = attendance?.externalCounts ?? [];
        const scopedExternalEntries = scope?.originTown
            ? rawExternalEntries.filter((x) => (x.scopeTown ?? activity.town) ===
                scope.originTown)
            : rawExternalEntries;
        const scopedExternalCounts = scope?.originTown
            ? rawExternalCounts.filter((x) => (x.scopeTown ?? activity.town) ===
                scope.originTown)
            : rawExternalCounts;
        const externalPresentCount = scopedExternalEntries.length +
            scopedExternalCounts.reduce((sum, x) => sum + (Number(x?.count) || 0), 0);
        const classificationMap = new Map();
        for (const row of out.byClassification ?? []) {
            classificationMap.set(String(row._id), (classificationMap.get(String(row._id)) ?? 0) + row.count);
        }
        for (const x of scopedExternalEntries) {
            const key = String(x.classificationLabel ?? 'unclassified');
            classificationMap.set(key, (classificationMap.get(key) ?? 0) + 1);
        }
        for (const x of scopedExternalCounts) {
            const key = String(x.classificationLabel ?? 'unclassified');
            const count = Number(x?.count) || 0;
            if (!count)
                continue;
            classificationMap.set(key, (classificationMap.get(key) ?? 0) + count);
        }
        const originTownMap = new Map();
        for (const row of out.byOriginTown ?? []) {
            originTownMap.set(String(row._id), (originTownMap.get(String(row._id)) ?? 0) + row.count);
        }
        for (const x of scopedExternalEntries) {
            const townKey = String(x.scopeTown ?? activity.town ?? 'unknown');
            originTownMap.set(townKey, (originTownMap.get(townKey) ?? 0) + 1);
        }
        for (const x of scopedExternalCounts) {
            const townKey = String(x.scopeTown ?? activity.town ?? 'unknown');
            const count = Number(x?.count) || 0;
            if (!count)
                continue;
            originTownMap.set(townKey, (originTownMap.get(townKey) ?? 0) + count);
        }
        const overallPresentCount = (childrenTotals.present ?? 0) + (monitorTotals.present ?? 0) + externalPresentCount;
        return {
            activityId,
            activityType: activity.type,
            activityTown: activity.town,
            startDate: new Date(activity.startDate),
            endDate: new Date(activity.endDate),
            takenAt: attendance?.takenAt,
            totalsByRole: {
                children: childrenTotals,
                monitors: monitorTotals,
            },
            externalPresentCount,
            overallPresentCount,
            byOriginTown: normalizeCounts([...originTownMap.entries()].map(([key, count]) => ({ key, count }))),
            byClassificationLabel: normalizeCounts([...classificationMap.entries()].map(([key, count]) => ({ key, count }))),
            byChildGroup: normalizeCounts((out.byChildGroup ?? []).map((x) => ({ key: String(x._id), count: x.count }))),
        };
    }
    async getYearlyAttendanceSummaryForUser(year, currentUser) {
        if (currentUser?.role !== user_enum_1.UserRole.Monitor) {
            throw new common_1.ForbiddenException('Only monitors can view reports');
        }
        if (currentUser?.monitorLevel === user_enum_1.MonitorLevel.Super) {
            return this.getYearlyAttendanceSummary(year);
        }
        const userTown = await this.townScopeService.resolveMonitorTown(currentUser);
        if (!userTown)
            throw new common_1.ForbiddenException('Monitor town not set');
        return this.getYearlyAttendanceSummary(year, { originTown: userTown });
    }
    async getYearlyAttendanceSummary(year, scope) {
        const start = new Date(Date.UTC(year, 0, 1, 0, 0, 0));
        const end = new Date(Date.UTC(year + 1, 0, 1, 0, 0, 0));
        const activityQuery = {
            startDate: { $gte: start, $lt: end },
        };
        if (scope?.originTown) {
            activityQuery.$or = [
                { type: activity_enum_1.ActivityType.Conference },
                { town: scope.originTown, type: { $ne: activity_enum_1.ActivityType.Conference } },
            ];
        }
        else if (scope?.activityTown) {
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
        const activityById = new Map();
        for (const a of activities) {
            activityById.set(String(a._id), {
                type: a.type,
                town: a.town,
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
                byTown: [],
                byActivityType: [],
                byClassificationLabel: [],
                byChildGroup: [],
            };
        }
        const match = {
            activityId: { $in: activityIds },
        };
        const entryMatch = {};
        if (scope?.originTown) {
            entryMatch['entries.originTownAtTime'] = scope.originTown;
        }
        const pipeline = [{ $match: match }, { $unwind: '$entries' }];
        if (Object.keys(entryMatch).length) {
            pipeline.push({ $match: entryMatch });
        }
        pipeline.push({
            $project: {
                activityId: '$activityId',
                present: '$entries.present',
                roleAtTime: '$entries.roleAtTime',
                originTownAtTime: '$entries.originTownAtTime',
                groupAtTime: '$entries.groupAtTime',
                classificationLabel: '$entries.classificationLabel',
            },
        }, {
            $addFields: {
                activityIdStr: { $toString: '$activityId' },
            },
        }, {
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
                    { $match: { roleAtTime: attendance_enum_1.AttendanceRoleAtTime.Child } },
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
        });
        const agg = await this.attendanceModel.aggregate(pipeline).exec();
        const out = agg?.[0] ?? {};
        const totalsRows = out.totals ?? [];
        const childrenRow = totalsRows.find((r) => r._id === attendance_enum_1.AttendanceRoleAtTime.Child);
        const monitorRow = totalsRows.find((r) => r._id === attendance_enum_1.AttendanceRoleAtTime.Monitor);
        const byActivityTypeCounts = new Map();
        for (const row of out.byActivityType ?? []) {
            const meta = activityById.get(String(row._id));
            if (!meta)
                continue;
            byActivityTypeCounts.set(meta.type, (byActivityTypeCounts.get(meta.type) ?? 0) + row.count);
        }
        const yearlyAttendanceDocs = await this.attendanceModel
            .find({ activityId: { $in: activityIds } })
            .select({ activityId: 1, externalEntries: 1 })
            .lean()
            .exec();
        const externalByClassification = new Map();
        const externalByTown = new Map();
        let externalPresentCount = 0;
        for (const doc of yearlyAttendanceDocs) {
            const meta = activityById.get(String(doc.activityId));
            if (!meta)
                continue;
            const external = doc.externalEntries ?? [];
            const legacyCounts = doc.externalCounts ?? [];
            for (const x of external) {
                const townKey = String(x.scopeTown ?? meta.town ?? 'unknown');
                if (scope?.originTown && townKey !== scope.originTown)
                    continue;
                externalPresentCount += 1;
                externalByTown.set(townKey, (externalByTown.get(townKey) ?? 0) + 1);
                const labelKey = String(x.classificationLabel ?? 'unclassified');
                externalByClassification.set(labelKey, (externalByClassification.get(labelKey) ?? 0) + 1);
            }
            for (const x of legacyCounts) {
                const count = Number(x?.count) || 0;
                if (!count)
                    continue;
                const townKey = String(x.scopeTown ?? meta.town ?? 'unknown');
                if (scope?.originTown && townKey !== scope.originTown)
                    continue;
                externalPresentCount += count;
                externalByTown.set(townKey, (externalByTown.get(townKey) ?? 0) + count);
                const labelKey = String(x.classificationLabel ?? 'unclassified');
                externalByClassification.set(labelKey, (externalByClassification.get(labelKey) ?? 0) + count);
            }
        }
        const eligible = await this.getEligibleTotalsForYear(activities, scope);
        const childrenPresent = childrenRow?.present ?? 0;
        const monitorsPresent = monitorRow?.present ?? 0;
        const childrenTotals = toTotals(childrenPresent, Math.max(eligible.childrenTotal, childrenPresent));
        const monitorTotals = toTotals(monitorsPresent, Math.max(eligible.monitorsTotal, monitorsPresent));
        const overallPresentCount = (childrenTotals.present ?? 0) + (monitorTotals.present ?? 0) + externalPresentCount;
        const classificationMap = new Map();
        for (const row of out.byClassification ?? []) {
            classificationMap.set(String(row._id), (classificationMap.get(String(row._id)) ?? 0) + row.count);
        }
        for (const [key, count] of externalByClassification.entries()) {
            classificationMap.set(key, (classificationMap.get(key) ?? 0) + count);
        }
        const townMap = new Map();
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
            byTown: normalizeCounts([...townMap.entries()].map(([key, count]) => ({ key, count }))),
            byActivityType: normalizeCounts([...byActivityTypeCounts.entries()].map(([key, count]) => ({ key, count }))),
            byClassificationLabel: normalizeCounts([...classificationMap.entries()].map(([key, count]) => ({ key, count }))),
            byChildGroup: normalizeCounts((out.byChildGroup ?? []).map((x) => ({ key: String(x._id), count: x.count }))),
        };
    }
    async getTurning19Report(year, scope) {
        const start = new Date(Date.UTC(year - 19, 0, 1, 0, 0, 0));
        const end = new Date(Date.UTC(year - 19 + 1, 0, 1, 0, 0, 0));
        const query = {
            role: user_enum_1.UserRole.Child,
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
    async notifySuperMonitorsAfterAttendance(activityId) {
        const stats = await this.getActivityAttendanceStats(activityId);
        const supers = await this.userModel
            .find({ role: user_enum_1.UserRole.Monitor, monitorLevel: user_enum_1.MonitorLevel.Super })
            .select({ _id: 1, email: 1 })
            .lean()
            .exec();
        const subject = 'Post-activity attendance stats';
        const baseRedirect = this.config.frontendBaseUrl;
        const detailsUrl = `${baseRedirect}/reports?mode=activity&activityId=${activityId}`;
        const expiresAt = (0, timezone_util_1.endOfDayInTimeZone)(new Date(), 'Africa/Douala');
        const message = `Activity ${stats.activityType} (${stats.activityTown})\\n` +
            `Children: ${stats.totalsByRole.children.present}/${stats.totalsByRole.children.total} present\\n` +
            `Monitors: ${stats.totalsByRole.monitors.present}/${stats.totalsByRole.monitors.total} present\\n` +
            `By town: ${stats.byOriginTown.map((x) => `${x.key}:${x.count}`).join(', ') || '-'}\\n` +
            `By classification: ${stats.byClassificationLabel.map((x) => `${x.key}:${x.count}`).join(', ') || '-'}`;
        for (const superUser of supers) {
            if (!superUser.email)
                continue;
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
                contextType: notification_enum_1.NotificationContextType.AttendanceReport,
                contextId: String(activityId),
            });
        }
    }
    async assertCanReadActivityReports(activity, currentUser) {
        if (currentUser?.role !== user_enum_1.UserRole.Monitor) {
            throw new common_1.ForbiddenException('Only monitors can view reports');
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
    async getEligibleTotalsForActivity(activity, scope) {
        const invitedChildrenTotal = (activity.invitedChildrenUserIds ?? []).length;
        const invitedMonitorsTotal = (activity.invitedMonitorUserIds ?? []).length;
        if (!scope?.originTown) {
            return { childrenTotal: invitedChildrenTotal, monitorsTotal: invitedMonitorsTotal };
        }
        const town = scope.originTown;
        if (activity.type !== activity_enum_1.ActivityType.Conference) {
            if (activity.town !== town) {
                return { childrenTotal: 0, monitorsTotal: 0 };
            }
            return { childrenTotal: invitedChildrenTotal, monitorsTotal: invitedMonitorsTotal };
        }
        const invitedChildIds = (activity.invitedChildrenUserIds ?? []).map((x) => (typeof x === 'string' ? new mongoose_2.Types.ObjectId(x) : x));
        const childrenTotal = invitedChildIds.length
            ? await this.userModel
                .countDocuments({
                _id: { $in: invitedChildIds },
                role: user_enum_1.UserRole.Child,
                originTown: town,
            })
                .exec()
            : 0;
        const monitorsTotal = await this.userModel
            .countDocuments({
            role: user_enum_1.UserRole.Monitor,
            lifecycleStatus: user_enum_1.LifecycleStatus.Active,
            originTown: town,
        })
            .exec();
        return { childrenTotal, monitorsTotal };
    }
    async getEligibleTotalsForYear(activities, scope) {
        if (!scope?.originTown) {
            return {
                childrenTotal: activities.reduce((sum, a) => sum + ((a.invitedChildrenUserIds ?? []).length || 0), 0),
                monitorsTotal: activities.reduce((sum, a) => sum + ((a.invitedMonitorUserIds ?? []).length || 0), 0),
            };
        }
        const town = scope.originTown;
        const monitorsTotalInTown = await this.userModel
            .countDocuments({
            role: user_enum_1.UserRole.Monitor,
            lifecycleStatus: user_enum_1.LifecycleStatus.Active,
            originTown: town,
        })
            .exec();
        let childrenTotal = 0;
        let monitorsTotal = 0;
        for (const a of activities) {
            if (a.type === activity_enum_1.ActivityType.Conference) {
                const invitedChildIds = (a.invitedChildrenUserIds ?? []).map((x) => typeof x === 'string' ? new mongoose_2.Types.ObjectId(x) : x);
                if (invitedChildIds.length) {
                    childrenTotal += await this.userModel
                        .countDocuments({
                        _id: { $in: invitedChildIds },
                        role: user_enum_1.UserRole.Child,
                        originTown: town,
                    })
                        .exec();
                }
                monitorsTotal += monitorsTotalInTown;
                continue;
            }
            if (a.town !== town)
                continue;
            childrenTotal += (a.invitedChildrenUserIds ?? []).length || 0;
            monitorsTotal += (a.invitedMonitorUserIds ?? []).length || 0;
        }
        return { childrenTotal, monitorsTotal };
    }
};
exports.ReportingService = ReportingService;
exports.ReportingService = ReportingService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(activity_schema_1.Activity.name)),
    __param(1, (0, mongoose_1.InjectModel)(attendance_schema_1.Attendance.name)),
    __param(2, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        notifications_service_1.NotificationService,
        town_scope_service_1.TownScopeService,
        recipients_resolver_service_1.RecipientsResolverService,
        job_runs_service_1.JobRunsService,
        app_config_service_1.AppConfigService])
], ReportingService);
//# sourceMappingURL=reporting.service.js.map