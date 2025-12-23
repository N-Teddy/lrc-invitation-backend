import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
    IsArray,
    IsDateString,
    IsEnum,
    IsMongoId,
    IsOptional,
    IsString,
    Min,
} from 'class-validator';
import { ActivityType, TargetingCode, Town } from '../../common/enums/activity.enum';

export class CreateActivityDto {
    @ApiProperty({ enum: ActivityType })
    @IsEnum(ActivityType)
    type: ActivityType;

    @ApiProperty({ enum: Town })
    @IsEnum(Town)
    town: Town;

    @ApiProperty()
    @IsDateString()
    startDate: string;

    @ApiProperty()
    @IsDateString()
    endDate: string;

    @ApiPropertyOptional({ description: 'Required for conferences (2 or 5).', minimum: 1 })
    @Min(1)
    @IsOptional()
    conferenceDurationDays?: number;

    @ApiProperty({ enum: TargetingCode })
    @IsEnum(TargetingCode)
    targetingCode: TargetingCode;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    notes?: string;
}

export class UpdateActivityDto extends PartialType(CreateActivityDto) {}

export class UpdateActivityInvitationsDto {
    @ApiPropertyOptional({ type: [String] })
    @IsArray()
    @IsMongoId({ each: true })
    @IsOptional()
    invitedChildrenUserIds?: string[];

    @ApiPropertyOptional({ type: [String] })
    @IsArray()
    @IsMongoId({ each: true })
    @IsOptional()
    invitedMonitorUserIds?: string[];
}
