import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ActivityType, TargetingCode, Town } from '../../common/enums/activity.enum';

export class ActivityResponseDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    year: number;

    @ApiProperty({ enum: ActivityType })
    type: ActivityType;

    @ApiProperty({ enum: Town })
    town: Town;

    @ApiProperty()
    startDate: Date;

    @ApiProperty()
    endDate: Date;

    @ApiProperty({ description: 'True when the activity has ended (based on endDate).' })
    ended: boolean;

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
    createdReason?: string;

    @ApiPropertyOptional()
    notes?: string;

    @ApiPropertyOptional()
    createdAt?: Date;

    @ApiPropertyOptional()
    updatedAt?: Date;
}
