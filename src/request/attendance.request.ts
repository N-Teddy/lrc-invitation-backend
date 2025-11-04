import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
	IsNotEmpty,
	IsUUID,
	IsBoolean,
	IsArray,
	ValidateNested,
	IsOptional,
	IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum AttendeeType {
	CHILD = 'child',
	PARENT = 'parent',
}

export class AttendanceRecordDto {
	@ApiProperty()
	@IsUUID()
	@IsNotEmpty()
	childId: string;

	@ApiProperty()
	@IsBoolean()
	@IsNotEmpty()
	wasPresent: boolean;

	@ApiProperty({ enum: AttendeeType, example: AttendeeType.CHILD })
	@IsEnum(AttendeeType)
	@IsNotEmpty()
	attendeeType: AttendeeType;

	@ApiPropertyOptional({
		description: 'If attendeeType is PARENT, specify which parent attended',
		example: 'Mr. John Smith',
	})
	@IsOptional()
	@IsNotEmpty()
	attendeeName?: string;
}

export class MarkAttendanceRequest {
	@ApiProperty({ type: [AttendanceRecordDto] })
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => AttendanceRecordDto)
	records: AttendanceRecordDto[];
}

export class UpdateAttendanceRequest {
	@ApiProperty()
	@IsBoolean()
	@IsNotEmpty()
	wasPresent: boolean;

	@ApiPropertyOptional({ enum: AttendeeType })
	@IsEnum(AttendeeType)
	@IsOptional()
	attendeeType?: AttendeeType;

	@ApiPropertyOptional()
	@IsOptional()
	attendeeName?: string;
}
