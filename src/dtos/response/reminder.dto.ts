import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Channel, ReminderKind, ReminderStatus } from '../../common/enums/notification.enum';
import { ReminderScheduleType } from '../../schema/reminder.schema';

export class ReminderExpectedResponseResponseDto {
    @ApiProperty()
    label: string;

    @ApiProperty()
    value: string;
}

export class ReminderScheduleResponseDto {
    @ApiPropertyOptional({ enum: ReminderScheduleType })
    type?: ReminderScheduleType;

    @ApiPropertyOptional()
    runAt?: Date;

    @ApiPropertyOptional()
    intervalMinutes?: number;

    @ApiPropertyOptional()
    hour?: number;

    @ApiPropertyOptional()
    minute?: number;

    @ApiPropertyOptional()
    dayOfWeek?: number;

    @ApiPropertyOptional()
    dayOfMonth?: number;
}

export class ReminderResponseDto {
    @ApiProperty()
    id: string;

    @ApiProperty({ enum: ReminderKind })
    kind: ReminderKind;

    @ApiPropertyOptional()
    createdByUserId?: string;

    @ApiProperty()
    message: string;

    @ApiProperty({ enum: Channel })
    channel: Channel;

    @ApiPropertyOptional({ type: ReminderScheduleResponseDto })
    schedule?: ReminderScheduleResponseDto;

    @ApiPropertyOptional()
    nextRunAt?: Date;

    @ApiPropertyOptional()
    lastSentAt?: Date;

    @ApiProperty({ type: [String] })
    recipients: string[];

    @ApiProperty({ type: [String] })
    awaitingAckUserIds: string[];

    @ApiProperty({ type: [String] })
    acknowledgedByUserIds: string[];

    @ApiProperty({ type: [ReminderExpectedResponseResponseDto] })
    expectedResponses: ReminderExpectedResponseResponseDto[];

    @ApiProperty({ enum: ReminderStatus })
    status: ReminderStatus;

    @ApiPropertyOptional()
    context?: Record<string, any>;

    @ApiPropertyOptional()
    createdAt?: Date;

    @ApiPropertyOptional()
    updatedAt?: Date;
}

export class RemindersListResponseDto {
    @ApiProperty({ type: [ReminderResponseDto] })
    items: ReminderResponseDto[];
}
