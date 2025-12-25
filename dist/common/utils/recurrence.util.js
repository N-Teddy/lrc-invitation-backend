"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeNextRunAt = computeNextRunAt;
const groups_util_1 = require("./groups.util");
const reminder_schema_1 = require("../../schema/reminder.schema");
const DEFAULT_TIME_ZONE = 'Africa/Douala';
function computeNextRunAt(schedule, from, timeZone = DEFAULT_TIME_ZONE) {
    const type = schedule.type;
    if (!type)
        return undefined;
    if (type === reminder_schema_1.ReminderScheduleType.Once) {
        return schedule.runAt;
    }
    if (type === reminder_schema_1.ReminderScheduleType.IntervalMinutes) {
        const mins = schedule.intervalMinutes ?? 0;
        if (mins <= 0)
            return undefined;
        return new Date(from.getTime() + mins * 60_000);
    }
    const hour = schedule.hour ?? 0;
    const minute = schedule.minute ?? 0;
    if (type === reminder_schema_1.ReminderScheduleType.Daily) {
        return nextDailyAt(from, hour, minute, timeZone);
    }
    if (type === reminder_schema_1.ReminderScheduleType.Weekly) {
        const dow = schedule.dayOfWeek ?? 0;
        return nextWeeklyAt(from, dow, hour, minute, timeZone);
    }
    if (type === reminder_schema_1.ReminderScheduleType.Monthly) {
        const dom = schedule.dayOfMonth ?? 1;
        return nextMonthlyAt(from, dom, hour, minute, timeZone);
    }
    return undefined;
}
function nextDailyAt(from, hour, minute, timeZone) {
    const parts = (0, groups_util_1.getDatePartsInTimeZone)(from, timeZone);
    const next = new Date(from);
    next.setFullYear(parts.year, parts.month - 1, parts.day);
    next.setHours(hour, minute, 0, 0);
    if (next.getTime() <= from.getTime()) {
        next.setDate(next.getDate() + 1);
    }
    return next;
}
function nextWeeklyAt(from, dayOfWeek, hour, minute, timeZone) {
    const parts = (0, groups_util_1.getDatePartsInTimeZone)(from, timeZone);
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
function nextMonthlyAt(from, dayOfMonth, hour, minute, timeZone) {
    const parts = (0, groups_util_1.getDatePartsInTimeZone)(from, timeZone);
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
//# sourceMappingURL=recurrence.util.js.map