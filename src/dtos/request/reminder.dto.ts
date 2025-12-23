import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsArray,
    IsEnum,
    IsInt,
    IsMongoId,
    IsOptional,
    IsString,
    Max,
    Min,
    ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Channel, ReminderStatus } from '../../common/enums/notification.enum';
import { ReminderScheduleType } from '../../schema/reminder.schema';

export class ReminderExpectedResponseDto {
    @ApiProperty()
    @IsString()
    label: string;

    @ApiProperty()
    @IsString()
    value: string;
}

export class ReminderScheduleDto {
    @ApiProperty({ enum: ReminderScheduleType })
    @IsEnum(ReminderScheduleType)
    type: ReminderScheduleType;

    @ApiPropertyOptional({ description: 'For once: ISO datetime' })
    @IsString()
    @IsOptional()
    runAt?: string;

    @ApiPropertyOptional({ description: 'For interval_minutes' })
    @IsInt()
    @Min(1)
    @IsOptional()
    intervalMinutes?: number;

    @ApiPropertyOptional({ description: 'For daily/weekly/monthly' })
    @IsInt()
    @Min(0)
    @Max(23)
    @IsOptional()
    hour?: number;

    @ApiPropertyOptional({ description: 'For daily/weekly/monthly' })
    @IsInt()
    @Min(0)
    @Max(59)
    @IsOptional()
    minute?: number;

    @ApiPropertyOptional({ description: 'For weekly (0=Sun..6=Sat)' })
    @IsInt()
    @Min(0)
    @Max(6)
    @IsOptional()
    dayOfWeek?: number;

    @ApiPropertyOptional({ description: 'For monthly (1..31)' })
    @IsInt()
    @Min(1)
    @Max(31)
    @IsOptional()
    dayOfMonth?: number;
}

export class CreateReminderDto {
    @ApiProperty()
    @IsString()
    message: string;

    @ApiProperty({ type: [String], description: 'User IDs' })
    @IsArray()
    @IsMongoId({ each: true })
    recipients: string[];

    @ApiPropertyOptional({ enum: Channel, default: Channel.WhatsApp })
    @IsEnum(Channel)
    @IsOptional()
    channel?: Channel;

    @ApiPropertyOptional({ type: ReminderScheduleDto })
    @ValidateNested()
    @Type(() => ReminderScheduleDto)
    @IsOptional()
    schedule?: ReminderScheduleDto;

    @ApiPropertyOptional({ type: [ReminderExpectedResponseDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ReminderExpectedResponseDto)
    @IsOptional()
    expectedResponses?: ReminderExpectedResponseDto[];
}

export class UpdateReminderDto {
    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    message?: string;

    @ApiPropertyOptional({ type: [String], description: 'User IDs' })
    @IsArray()
    @IsMongoId({ each: true })
    @IsOptional()
    recipients?: string[];

    @ApiPropertyOptional({ enum: Channel })
    @IsEnum(Channel)
    @IsOptional()
    channel?: Channel;

    @ApiPropertyOptional({ type: ReminderScheduleDto })
    @ValidateNested()
    @Type(() => ReminderScheduleDto)
    @IsOptional()
    schedule?: ReminderScheduleDto;

    @ApiPropertyOptional({ type: [ReminderExpectedResponseDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ReminderExpectedResponseDto)
    @IsOptional()
    expectedResponses?: ReminderExpectedResponseDto[];

    @ApiPropertyOptional({ enum: ReminderStatus })
    @IsEnum(ReminderStatus)
    @IsOptional()
    status?: ReminderStatus;
}
