import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
	IsNotEmpty,
	IsString,
	IsDateString,
	IsUUID,
	IsEnum,
	IsOptional,
	IsArray,
	ArrayMinSize,
} from 'class-validator';
import { ActivityType } from '../common/enums/activity-type.enum';

export class CreateActivityRequest {
	@ApiProperty({ example: 'Sunday Service for Group A & B' })
	@IsString()
	@IsNotEmpty()
	title: string;

	@ApiProperty({ enum: ActivityType, example: ActivityType.SERVICE })
	@IsEnum(ActivityType)
	@IsNotEmpty()
	activityType: ActivityType;

	@ApiProperty()
	@IsUUID()
	@IsNotEmpty()
	townId: string;

	@ApiProperty({ example: '2024-02-15T09:00:00Z' })
	@IsDateString()
	@IsNotEmpty()
	startDate: string;

	@ApiProperty({ example: '2024-02-15T12:00:00Z' })
	@IsDateString()
	@IsNotEmpty()
	endDate: string;

	@ApiPropertyOptional({ example: 'Church Main Hall' })
	@IsString()
	@IsOptional()
	location?: string;

	@ApiPropertyOptional({ example: 'Special service with guest speaker' })
	@IsString()
	@IsOptional()
	description?: string;

	@ApiProperty({
		type: [String],
		example: ['uuid-of-age-group-a', 'uuid-of-age-group-b'],
		description: 'Array of age group IDs that can participate',
	})
	@IsArray()
	@ArrayMinSize(1)
	@IsUUID('4', { each: true })
	targetGroupIds: string[];
}

export class UpdateActivityRequest {
	@ApiPropertyOptional({ example: 'Sunday Service for Group A & B' })
	@IsString()
	@IsOptional()
	title?: string;

	@ApiPropertyOptional({ enum: ActivityType })
	@IsEnum(ActivityType)
	@IsOptional()
	activityType?: ActivityType;

	@ApiPropertyOptional()
	@IsUUID()
	@IsOptional()
	townId?: string;

	@ApiPropertyOptional({ example: '2024-02-15T09:00:00Z' })
	@IsDateString()
	@IsOptional()
	startDate?: string;

	@ApiPropertyOptional({ example: '2024-02-15T12:00:00Z' })
	@IsDateString()
	@IsOptional()
	endDate?: string;

	@ApiPropertyOptional({ example: 'Church Main Hall' })
	@IsString()
	@IsOptional()
	location?: string;

	@ApiPropertyOptional({ example: 'Special service with guest speaker' })
	@IsString()
	@IsOptional()
	description?: string;

	@ApiPropertyOptional({
		type: [String],
		description: 'Array of age group IDs that can participate',
	})
	@IsArray()
	@IsOptional()
	@IsUUID('4', { each: true })
	targetGroupIds?: string[];
}

export class SendNotificationRequest {
	@ApiProperty({ enum: ['email', 'whatsapp', 'both'], example: 'both' })
	@IsEnum(['email', 'whatsapp', 'both'])
	@IsNotEmpty()
	channel: 'email' | 'whatsapp' | 'both';
}
