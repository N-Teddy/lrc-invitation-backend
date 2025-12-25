import { ActivityType } from '../../common/enums/activity.enum';
export declare class ChildAttendanceTypeBreakdownDto {
    activityType: ActivityType;
    totalRecords: number;
    presentCount: number;
    absentCount: number;
    lastPresentAt?: Date;
}
export declare class ChildStatsResponseDto {
    childId: string;
    totalAttendanceRecords: number;
    presentCount: number;
    absentCount: number;
    lastAttendanceAt?: Date;
    lastPresentAt?: Date;
    byActivityType: ChildAttendanceTypeBreakdownDto[];
}
