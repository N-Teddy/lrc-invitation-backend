export function getDatePartsInTimeZone(date: Date, timeZone: string) {
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

export function formatMonthDay(date: Date, timeZone: string) {
    return new Intl.DateTimeFormat('en-GB', {
        timeZone,
        month: 'short',
        day: '2-digit',
    }).format(date);
}

export function formatMonthDayYear(date: Date, timeZone: string) {
    return new Intl.DateTimeFormat('en-GB', {
        timeZone,
        year: 'numeric',
        month: 'short',
        day: '2-digit',
    }).format(date);
}

export function formatMonthYear(date: Date, timeZone: string) {
    return new Intl.DateTimeFormat('en-GB', {
        timeZone,
        year: 'numeric',
        month: 'long',
    }).format(date);
}
