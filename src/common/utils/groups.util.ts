const DEFAULT_TIME_ZONE = 'Africa/Douala';

export function getDatePartsInTimeZone(date: Date, timeZone = DEFAULT_TIME_ZONE) {
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

export function computeAgeYears(dateOfBirth: Date, asOf: Date, timeZone = DEFAULT_TIME_ZONE) {
    const dob = getDatePartsInTimeZone(dateOfBirth, timeZone);
    const now = getDatePartsInTimeZone(asOf, timeZone);

    let age = now.year - dob.year;
    if (now.month < dob.month || (now.month === dob.month && now.day < dob.day)) {
        age -= 1;
    }
    return age;
}

export function startOfDayKey(date: Date, timeZone = DEFAULT_TIME_ZONE) {
    const p = getDatePartsInTimeZone(date, timeZone);
    return `${p.year}-${String(p.month).padStart(2, '0')}-${String(p.day).padStart(2, '0')}`;
}
