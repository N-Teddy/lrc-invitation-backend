import { Town } from '../common/enums/activity.enum';
import { ReportingService } from './reporting.service';
export declare class ReportingController {
    private readonly reportingService;
    constructor(reportingService: ReportingService);
    activityAttendanceStats(activityId: string, currentUser: any): Promise<{
        activityId: string;
        activityType: import("../common/enums/activity.enum").ActivityType;
        activityTown: Town;
        startDate: Date;
        endDate: Date;
        takenAt: Date;
        totalsByRole: {
            children: {
                present: number;
                absent: number;
                total: number;
            };
            monitors: {
                present: number;
                absent: number;
                total: number;
            };
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
    yearlyAttendanceSummary(yearStr: string, currentUser: any, town?: Town): Promise<{
        year: number;
        totalsByRole: {
            children: {
                present: number;
                absent: number;
                total: number;
            };
            monitors: {
                present: number;
                absent: number;
                total: number;
            };
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
    turning19Report(yearStr: string, town?: Town): Promise<{
        year: number;
        count: number;
        children: {
            userId: string;
            fullName: string;
            dateOfBirth: Date;
            originTown: Town;
        }[];
    }>;
}
