import { getDatePartsInTimeZone } from './groups.util';
import { ReminderScheduleType } from '../../schema/reminder.schema';

const DEFAULT_TIME_ZONE = 'Africa/Douala';

export function computeNextRunAt(
    schedule: {
        type?: ReminderScheduleType;
        runAt?: Date;
        intervalMinutes?: number;
        hour?: number;
        minute?: number;
        dayOfWeek?: number;
        dayOfMonth?: number;
    },
    from: Date,
    timeZone = DEFAULT_TIME_ZONE,
): Date | undefined {
    const type = schedule.type;
    if (!type) return undefined;

    if (type === ReminderScheduleType.Once) {
        return schedule.runAt;
    }

    if (type === ReminderScheduleType.IntervalMinutes) {
        const mins = schedule.intervalMinutes ?? 0;
        if (mins <= 0) return undefined;
        return new Date(from.getTime() + mins * 60_000);
    }

    const hour = schedule.hour ?? 0;
    const minute = schedule.minute ?? 0;

    if (type === ReminderScheduleType.Daily) {
        return nextDailyAt(from, hour, minute, timeZone);
    }

    if (type === ReminderScheduleType.Weekly) {
        const dow = schedule.dayOfWeek ?? 0;
        return nextWeeklyAt(from, dow, hour, minute, timeZone);
    }

    if (type === ReminderScheduleType.Monthly) {
        const dom = schedule.dayOfMonth ?? 1;
        return nextMonthlyAt(from, dom, hour, minute, timeZone);
    }

    return undefined;
}

function nextDailyAt(from: Date, hour: number, minute: number, timeZone: string) {
    const parts = getDatePartsInTimeZone(from, timeZone);
    const next = new Date(from);
    next.setFullYear(parts.year, parts.month - 1, parts.day);
    next.setHours(hour, minute, 0, 0);
    if (next.getTime() <= from.getTime()) {
        next.setDate(next.getDate() + 1);
    }
    return next;
}

function nextWeeklyAt(
    from: Date,
    dayOfWeek: number,
    hour: number,
    minute: number,
    timeZone: string,
) {
    const parts = getDatePartsInTimeZone(from, timeZone);
    const base = new Date(from);
    base.setFullYear(parts.year, parts.month - 1, parts.day);
    base.setHours(hour, minute, 0, 0);

    const currentDow = base.getDay();
    let deltaDays = (dayOfWeek - currentDow + 7) % 7;
    if (deltaDays === 0 && base.getTime() <= from.getTime()) {
        deltaDays = 7;
    }
    base.setDate(base.getDate() + deltaDays);
    return base;
}

function nextMonthlyAt(
    from: Date,
    dayOfMonth: number,
    hour: number,
    minute: number,
    timeZone: string,
) {
    const parts = getDatePartsInTimeZone(from, timeZone);
    const next = new Date(from);
    next.setFullYear(parts.year, parts.month - 1, 1);
    next.setHours(hour, minute, 0, 0);

    const daysInMonth = new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate();
    next.setDate(Math.min(dayOfMonth, daysInMonth));

    if (next.getTime() <= from.getTime()) {
        next.setMonth(next.getMonth() + 1, 1);
        const daysInNextMonth = new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate();
        next.setDate(Math.min(dayOfMonth, daysInNextMonth));
        next.setHours(hour, minute, 0, 0);
    }
    return next;
}
