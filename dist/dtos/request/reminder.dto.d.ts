import { Channel, ReminderStatus } from '../../common/enums/notification.enum';
import { ReminderScheduleType } from '../../schema/reminder.schema';
export declare class ReminderExpectedResponseDto {
    label: string;
    value: string;
}
export declare class ReminderScheduleDto {
    type: ReminderScheduleType;
    runAt?: string;
    intervalMinutes?: number;
    hour?: number;
    minute?: number;
    dayOfWeek?: number;
    dayOfMonth?: number;
}
export declare class CreateReminderDto {
    message: string;
    recipients: string[];
    channel?: Channel;
    schedule?: ReminderScheduleDto;
    expectedResponses?: ReminderExpectedResponseDto[];
}
export declare class UpdateReminderDto {
    message?: string;
    recipients?: string[];
    channel?: Channel;
    schedule?: ReminderScheduleDto;
    expectedResponses?: ReminderExpectedResponseDto[];
    status?: ReminderStatus;
}
export declare class RespondReminderDto {
    value: string;
}
