import { ReminderScheduleType } from '../../schema/reminder.schema';
export declare function computeNextRunAt(schedule: {
    type?: ReminderScheduleType;
    runAt?: Date;
    intervalMinutes?: number;
    hour?: number;
    minute?: number;
    dayOfWeek?: number;
    dayOfMonth?: number;
}, from: Date, timeZone?: string): Date | undefined;
