import {
    IsString,
    IsEnum,
    IsOptional,
    IsDateString,
    IsInt,
    IsNotEmpty,
    Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ActivityType } from '../../common/enums/activity-type.enum';
import { Region } from '../../common/enums/region.enum';
import { AgeGroup } from '../../common/enums/age-group.enum';

export class CreateActivityDto {
    @ApiProperty({ example: 'Sunday School - Week 1' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ enum: ActivityType, example: ActivityType.CONFERENCE })
    @IsEnum(ActivityType)
    type: ActivityType;

    @ApiProperty({ example: '2024-12-15' })
    @IsDateString()
    date: string;

    @ApiPropertyOptional({ example: '10:00:00' })
    @IsOptional()
    @IsString()
    @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/, {
        message: 'Time must be in format HH:MM or HH:MM:SS',
    })
    time?: string;

    @ApiProperty({ enum: Region, example: Region.YAOUNDE })
    @IsEnum(Region)
    region: Region;

    @ApiPropertyOptional({ enum: AgeGroup, example: AgeGroup.B })
    @IsOptional()
    @IsEnum(AgeGroup)
    targetAgeGroup?: AgeGroup;

    @ApiPropertyOptional({ example: 'Bible study session for children' })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional({ example: 'Church Main Hall, Yaoundé' })
    @IsOptional()
    @IsString()
    location?: string;

    @ApiProperty({ example: 1 })
    @IsInt()
    monitorId: number;
}

export class UpdateActivityDto {
    @ApiPropertyOptional({ example: 'Sunday School - Week 1' })
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    name?: string;

    @ApiPropertyOptional({ enum: ActivityType, example: ActivityType.CONFERENCE })
    @IsOptional()
    @IsEnum(ActivityType)
    type?: ActivityType;

    @ApiPropertyOptional({ example: '2024-12-15' })
    @IsOptional()
    @IsDateString()
    date?: string;

    @ApiPropertyOptional({ example: '10:00:00' })
    @IsOptional()
    @IsString()
    @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/, {
        message: 'Time must be in format HH:MM or HH:MM:SS',
    })
    time?: string;

    @ApiPropertyOptional({ enum: Region, example: Region.YAOUNDE })
    @IsOptional()
    @IsEnum(Region)
    region?: Region;

    @ApiPropertyOptional({ enum: AgeGroup, example: AgeGroup.B })
    @IsOptional()
    @IsEnum(AgeGroup)
    targetAgeGroup?: AgeGroup;

    @ApiPropertyOptional({ example: 'Bible study session for children' })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional({ example: 'Church Main Hall, Yaoundé' })
    @IsOptional()
    @IsString()
    location?: string;

    @ApiPropertyOptional({ example: 1 })
    @IsOptional()
    @IsInt()
    monitorId?: number;
}
