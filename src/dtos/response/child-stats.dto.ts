import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ActivityType } from '../../common/enums/activity.enum';

export class ChildAttendanceTypeBreakdownDto {
    @ApiProperty({ enum: ActivityType })
    activityType: ActivityType;

    @ApiProperty()
    totalRecords: number;

    @ApiProperty()
    presentCount: number;

    @ApiProperty()
    absentCount: number;

    @ApiPropertyOptional()
    lastPresentAt?: Date;
}

export class ChildStatsResponseDto {
    @ApiProperty()
    childId: string;

    @ApiProperty()
    totalAttendanceRecords: number;

    @ApiProperty()
    presentCount: number;

    @ApiProperty()
    absentCount: number;

    @ApiPropertyOptional()
    lastAttendanceAt?: Date;

    @ApiPropertyOptional()
    lastPresentAt?: Date;

    @ApiProperty({ type: [ChildAttendanceTypeBreakdownDto] })
    byActivityType: ChildAttendanceTypeBreakdownDto[];
}
