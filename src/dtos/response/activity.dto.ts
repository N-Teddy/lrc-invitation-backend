import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ActivityType, TargetingCode, Town } from '../../common/enums/activity.enum';

export class ActivityResponseDto {
    @ApiProperty()
    id: string;

    @ApiProperty({ enum: ActivityType })
    type: ActivityType;

    @ApiProperty({ enum: Town })
    town: Town;

    @ApiProperty()
    startDate: Date;

    @ApiProperty()
    endDate: Date;

    @ApiPropertyOptional()
    conferenceDurationDays?: number;

    @ApiProperty({ enum: TargetingCode })
    targetingCode: TargetingCode;

    @ApiPropertyOptional({ type: [String] })
    invitedChildrenUserIds?: string[];

    @ApiPropertyOptional({ type: [String] })
    invitedMonitorUserIds?: string[];

    @ApiPropertyOptional()
    createdByUserId?: string;

    @ApiPropertyOptional()
    notes?: string;

    @ApiPropertyOptional()
    createdAt?: Date;

    @ApiPropertyOptional()
    updatedAt?: Date;
}
