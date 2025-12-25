import { Channel, ReminderKind, ReminderStatus } from '../../common/enums/notification.enum';
import { ReminderScheduleType } from '../../schema/reminder.schema';
export declare class ReminderExpectedResponseResponseDto {
    label: string;
    value: string;
}
export declare class ReminderScheduleResponseDto {
    type?: ReminderScheduleType;
    runAt?: Date;
    intervalMinutes?: number;
    hour?: number;
    minute?: number;
    dayOfWeek?: number;
    dayOfMonth?: number;
}
export declare class ReminderResponseDto {
    id: string;
    kind: ReminderKind;
    createdByUserId?: string;
    message: string;
    channel: Channel;
    schedule?: ReminderScheduleResponseDto;
    nextRunAt?: Date;
    lastSentAt?: Date;
    recipients: string[];
    awaitingAckUserIds: string[];
    acknowledgedByUserIds: string[];
    expectedResponses: ReminderExpectedResponseResponseDto[];
    status: ReminderStatus;
    context?: Record<string, any>;
    createdAt?: Date;
    updatedAt?: Date;
}
export declare class RemindersListResponseDto {
    items: ReminderResponseDto[];
}
