import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    IsArray,
    IsDateString,
    IsEnum,
    IsMongoId,
    IsOptional,
    IsString,
    IsInt,
    Min,
    ValidateNested,
} from 'class-validator';
import { ActivityType, TargetingCode, Town } from '../../common/enums/activity.enum';

export class CreateActivityDto {
    @ApiProperty({ enum: ActivityType })
    @IsEnum(ActivityType)
    type: ActivityType;

    @ApiPropertyOptional({
        enum: Town,
        description: 'Derived from the creator town for non-conferences',
    })
    @IsEnum(Town)
    @IsOptional()
    town?: Town;

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

    @ApiPropertyOptional({
        description: 'Required when creating an activity in a locked year.',
    })
    @IsString()
    @IsOptional()
    reason?: string;
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

export class BulkCreateActivitiesDto {
    @ApiProperty({ description: 'Target year for the batch.' })
    @IsInt()
    @Min(2000)
    year: number;

    @ApiProperty({ type: [CreateActivityDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateActivityDto)
    activities: CreateActivityDto[];
}
