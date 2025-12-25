import { Model } from 'mongoose';
import { ActivityDocument } from '../schema/activity.schema';
import { AttendanceDocument } from '../schema/attendance.schema';
import { UserDocument } from '../schema/user.schema';
import { ActivityType, Town } from '../common/enums/activity.enum';
import { NotificationService } from '../notifications/notifications.service';
import { TownScopeService } from '../common/services/town-scope.service';
import { JobRunsService } from '../jobs/job-runs.service';
import { RecipientsResolverService } from '../common/services/recipients-resolver.service';
import { AppConfigService } from '../config/app-config.service';
type Totals = {
    present: number;
    absent: number;
    total: number;
};
export declare class ReportingService {
    private readonly activityModel;
    private readonly attendanceModel;
    private readonly userModel;
    private readonly notificationService;
    private readonly townScopeService;
    private readonly recipientsResolver;
    private readonly jobRuns;
    private readonly config;
    constructor(activityModel: Model<ActivityDocument>, attendanceModel: Model<AttendanceDocument>, userModel: Model<UserDocument>, notificationService: NotificationService, townScopeService: TownScopeService, recipientsResolver: RecipientsResolverService, jobRuns: JobRunsService, config: AppConfigService);
    sendTurning19YearlyReport(now?: Date): Promise<void>;
    getActivityAttendanceStatsForUser(activityId: string, currentUser: Record<string, any>): Promise<{
        activityId: string;
        activityType: ActivityType;
        activityTown: Town;
        startDate: Date;
        endDate: Date;
        takenAt: Date;
        totalsByRole: {
            children: Totals;
            monitors: Totals;
        };
        externalPresentCount: any;
        overallPresentCount: any;
        byOriginTown: {
            key: string;
            count: number;
        }[];
        byClassificationLabel: {
            key: string;
            count: number;
        }[];
        byChildGroup: {
            key: string;
            count: number;
        }[];
    }>;
    getActivityAttendanceStats(activityId: string, scope?: {
        originTown?: Town;
    }): Promise<{
        activityId: string;
        activityType: ActivityType;
        activityTown: Town;
        startDate: Date;
        endDate: Date;
        takenAt: Date;
        totalsByRole: {
            children: Totals;
            monitors: Totals;
        };
        externalPresentCount: any;
        overallPresentCount: any;
        byOriginTown: {
            key: string;
            count: number;
        }[];
        byClassificationLabel: {
            key: string;
            count: number;
        }[];
        byChildGroup: {
            key: string;
            count: number;
        }[];
    }>;
    getYearlyAttendanceSummaryForUser(year: number, currentUser: Record<string, any>): Promise<{
        year: number;
        totalsByRole: {
            children: Totals;
            monitors: Totals;
        };
        externalPresentCount: number;
        overallPresentCount: number;
        byTown: {
            key: string;
            count: number;
        }[];
        byActivityType: {
            key: string;
            count: number;
        }[];
        byClassificationLabel: {
            key: string;
            count: number;
        }[];
        byChildGroup: {
            key: string;
            count: number;
        }[];
    }>;
    getYearlyAttendanceSummary(year: number, scope?: {
        activityTown?: Town;
        originTown?: Town;
    }): Promise<{
        year: number;
        totalsByRole: {
            children: Totals;
            monitors: Totals;
        };
        externalPresentCount: number;
        overallPresentCount: number;
        byTown: {
            key: string;
            count: number;
        }[];
        byActivityType: {
            key: string;
            count: number;
        }[];
        byClassificationLabel: {
            key: string;
            count: number;
        }[];
        byChildGroup: {
            key: string;
            count: number;
        }[];
    }>;
    getTurning19Report(year: number, scope?: {
        originTown?: Town;
    }): Promise<{
        year: number;
        count: number;
        children: {
            userId: string;
            fullName: string;
            dateOfBirth: Date;
            originTown: Town;
        }[];
    }>;
    notifySuperMonitorsAfterAttendance(activityId: string): Promise<void>;
    private assertCanReadActivityReports;
    private getEligibleTotalsForActivity;
    private getEligibleTotalsForYear;
}
export {};
