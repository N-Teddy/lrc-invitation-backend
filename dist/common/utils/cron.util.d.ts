export declare function scheduleNextDailyRun(opts: {
    hour: number;
    minute: number;
    timeZone: string;
}, handler: () => Promise<void> | void): void;
export declare function scheduleEveryMs(ms: number, handler: () => Promise<void> | void, opts?: {
    initialDelayMs?: number;
}): void;
