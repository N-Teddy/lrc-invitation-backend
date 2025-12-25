"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDatePartsInTimeZone = getDatePartsInTimeZone;
exports.formatMonthDay = formatMonthDay;
exports.formatMonthDayYear = formatMonthDayYear;
exports.formatMonthYear = formatMonthYear;
exports.endOfDayInTimeZone = endOfDayInTimeZone;
function getDatePartsInTimeZone(date, timeZone) {
    const dtf = new Intl.DateTimeFormat('en-CA', {
        timeZone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    });
    const parts = dtf.formatToParts(date);
    const year = Number(parts.find((p) => p.type === 'year')?.value);
    const month = Number(parts.find((p) => p.type === 'month')?.value);
    const day = Number(parts.find((p) => p.type === 'day')?.value);
    return { year, month, day };
}
function formatMonthDay(date, timeZone) {
    return new Intl.DateTimeFormat('en-GB', {
        timeZone,
        month: 'short',
        day: '2-digit',
    }).format(date);
}
function formatMonthDayYear(date, timeZone) {
    return new Intl.DateTimeFormat('en-GB', {
        timeZone,
        year: 'numeric',
        month: 'short',
        day: '2-digit',
    }).format(date);
}
function formatMonthYear(date, timeZone) {
    return new Intl.DateTimeFormat('en-GB', {
        timeZone,
        year: 'numeric',
        month: 'long',
    }).format(date);
}
function getOffsetMinutes(date, timeZone) {
    const dtf = new Intl.DateTimeFormat('en-US', {
        timeZone,
        timeZoneName: 'shortOffset',
        hour: '2-digit',
        minute: '2-digit',
    });
    const parts = dtf.formatToParts(date);
    const tz = parts.find((p) => p.type === 'timeZoneName')?.value ?? 'GMT+0';
    const m = /GMT([+-]\d{1,2})(?::(\d{2}))?/.exec(tz);
    if (!m)
        return 0;
    const sign = m[1].startsWith('-') ? -1 : 1;
    const hours = Math.abs(Number(m[1]));
    const minutes = m[2] ? Number(m[2]) : 0;
    return sign * (hours * 60 + minutes);
}
function makeUtcFromZonedParts(parts, time, timeZone) {
    const baseUtc = Date.UTC(parts.year, parts.month - 1, parts.day, time.hour, time.minute, time.second ?? 0, time.ms ?? 0);
    let dt = new Date(baseUtc);
    for (let i = 0; i < 3; i += 1) {
        const offsetMin = getOffsetMinutes(dt, timeZone);
        const candidate = baseUtc - offsetMin * 60_000;
        if (candidate === dt.getTime())
            break;
        dt = new Date(candidate);
    }
    return dt;
}
function endOfDayInTimeZone(date, timeZone) {
    const parts = getDatePartsInTimeZone(date, timeZone);
    const nextDay = makeUtcFromZonedParts({ year: parts.year, month: parts.month, day: parts.day + 1 }, { hour: 0, minute: 0, second: 0, ms: 0 }, timeZone);
    return new Date(nextDay.getTime() - 1);
}
//# sourceMappingURL=timezone.util.js.map