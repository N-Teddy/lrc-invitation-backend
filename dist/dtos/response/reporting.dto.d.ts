import { ActivityType, ChildGroup, Town } from '../../common/enums/activity.enum';
export declare class AttendanceTotalsDto {
    present: number;
    absent: number;
    total: number;
}
export declare class AttendanceByRoleDto {
    children: AttendanceTotalsDto;
    monitors: AttendanceTotalsDto;
}
export declare class CountByKeyDto {
    key: string;
    count: number;
}
export declare class ActivityAttendanceStatsDto {
    activityId: string;
    activityType: ActivityType;
    activityTown: Town;
    startDate: Date;
    endDate: Date;
    takenAt?: Date;
    totalsByRole: AttendanceByRoleDto;
    externalPresentCount: number;
    overallPresentCount: number;
    byOriginTown: CountByKeyDto[];
    byClassificationLabel: CountByKeyDto[];
    byChildGroup: CountByKeyDto[];
}
export declare class YearlyAttendanceSummaryDto {
    year: number;
    totalsByRole: AttendanceByRoleDto;
    externalPresentCount: number;
    overallPresentCount: number;
    byTown: CountByKeyDto[];
    byActivityType: CountByKeyDto[];
    byClassificationLabel: CountByKeyDto[];
    byChildGroup: CountByKeyDto[];
}
export declare class Turning19ChildDto {
    userId: string;
    fullName: string;
    dateOfBirth: Date;
    originTown?: Town;
    groupAtTime?: ChildGroup;
}
export declare class Turning19ReportDto {
    year: number;
    count: number;
    children: Turning19ChildDto[];
}
