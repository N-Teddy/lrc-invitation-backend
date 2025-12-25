"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDatePartsInTimeZone = getDatePartsInTimeZone;
exports.computeAgeYears = computeAgeYears;
exports.startOfDayKey = startOfDayKey;
const DEFAULT_TIME_ZONE = 'Africa/Douala';
function getDatePartsInTimeZone(date, timeZone = DEFAULT_TIME_ZONE) {
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
function computeAgeYears(dateOfBirth, asOf, timeZone = DEFAULT_TIME_ZONE) {
    const dob = getDatePartsInTimeZone(dateOfBirth, timeZone);
    const now = getDatePartsInTimeZone(asOf, timeZone);
    let age = now.year - dob.year;
    if (now.month < dob.month || (now.month === dob.month && now.day < dob.day)) {
        age -= 1;
    }
    return age;
}
function startOfDayKey(date, timeZone = DEFAULT_TIME_ZONE) {
    const p = getDatePartsInTimeZone(date, timeZone);
    return `${p.year}-${String(p.month).padStart(2, '0')}-${String(p.day).padStart(2, '0')}`;
}
//# sourceMappingURL=groups.util.js.map