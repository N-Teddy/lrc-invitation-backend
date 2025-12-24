import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ActivityType, ChildGroup, Town } from '../../common/enums/activity.enum';

export class AttendanceTotalsDto {
    @ApiProperty()
    present: number;

    @ApiProperty()
    absent: number;

    @ApiProperty()
    total: number;
}

export class AttendanceByRoleDto {
    @ApiProperty({ type: AttendanceTotalsDto })
    children: AttendanceTotalsDto;

    @ApiProperty({ type: AttendanceTotalsDto })
    monitors: AttendanceTotalsDto;
}

export class CountByKeyDto {
    @ApiProperty()
    key: string;

    @ApiProperty()
    count: number;
}

export class ActivityAttendanceStatsDto {
    @ApiProperty()
    activityId: string;

    @ApiProperty({ enum: ActivityType })
    activityType: ActivityType;

    @ApiProperty({ enum: Town })
    activityTown: Town;

    @ApiProperty()
    startDate: Date;

    @ApiProperty()
    endDate: Date;

    @ApiPropertyOptional()
    takenAt?: Date;

    @ApiProperty({ type: AttendanceByRoleDto })
    totalsByRole: AttendanceByRoleDto;

    @ApiProperty({ description: 'Total present attendees not registered in the system.' })
    externalPresentCount: number;

    @ApiProperty({ description: 'Registered present + external present.' })
    overallPresentCount: number;

    @ApiProperty({ type: [CountByKeyDto] })
    byOriginTown: CountByKeyDto[];

    @ApiProperty({ type: [CountByKeyDto] })
    byClassificationLabel: CountByKeyDto[];

    @ApiProperty({ type: [CountByKeyDto] })
    byChildGroup: CountByKeyDto[];
}

export class YearlyAttendanceSummaryDto {
    @ApiProperty()
    year: number;

    @ApiProperty({ type: AttendanceByRoleDto })
    totalsByRole: AttendanceByRoleDto;

    @ApiProperty({ description: 'Total present attendees not registered in the system.' })
    externalPresentCount: number;

    @ApiProperty({ description: 'Registered present + external present.' })
    overallPresentCount: number;

    @ApiProperty({ type: [CountByKeyDto] })
    byTown: CountByKeyDto[];

    @ApiProperty({ type: [CountByKeyDto] })
    byActivityType: CountByKeyDto[];

    @ApiProperty({ type: [CountByKeyDto] })
    byClassificationLabel: CountByKeyDto[];

    @ApiProperty({ type: [CountByKeyDto] })
    byChildGroup: CountByKeyDto[];
}

export class Turning19ChildDto {
    @ApiProperty()
    userId: string;

    @ApiProperty()
    fullName: string;

    @ApiProperty()
    dateOfBirth: Date;

    @ApiPropertyOptional({ enum: Town })
    originTown?: Town;

    @ApiPropertyOptional({ enum: ChildGroup })
    groupAtTime?: ChildGroup;
}

export class Turning19ReportDto {
    @ApiProperty()
    year: number;

    @ApiProperty()
    count: number;

    @ApiProperty({ type: [Turning19ChildDto] })
    children: Turning19ChildDto[];
}
