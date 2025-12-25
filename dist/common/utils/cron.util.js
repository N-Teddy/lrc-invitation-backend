"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scheduleNextDailyRun = scheduleNextDailyRun;
exports.scheduleEveryMs = scheduleEveryMs;
function scheduleNextDailyRun(opts, handler) {
    const schedule = () => {
        const now = new Date();
        const next = getNextDailyTime(now, opts.hour, opts.minute, opts.timeZone);
        const delay = Math.max(1000, next.getTime() - now.getTime());
        setTimeout(async () => {
            try {
                await handler();
            }
            finally {
                schedule();
            }
        }, delay);
    };
    schedule();
}
function scheduleEveryMs(ms, handler, opts) {
    const initialDelayMs = opts?.initialDelayMs ?? 1000;
    const tick = () => {
        setTimeout(async () => {
            try {
                await handler();
            }
            finally {
                tick();
            }
        }, ms);
    };
    setTimeout(() => {
        void handler();
        tick();
    }, initialDelayMs);
}
function getNextDailyTime(now, hour, minute, timeZone) {
    const parts = getDatePartsInTimeZone(now, timeZone);
    const next = new Date(now);
    next.setFullYear(parts.year, parts.month - 1, parts.day);
    next.setHours(hour, minute, 0, 0);
    if (next.getTime() <= now.getTime()) {
        next.setDate(next.getDate() + 1);
    }
    return next;
}
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
//# sourceMappingURL=cron.util.js.map