export function computeBackoffMs(attempt: number) {
    const schedule = [60_000, 300_000, 900_000, 3_600_000, 21_600_000, 86_400_000];
    const idx = Math.min(Math.max(0, attempt - 1), schedule.length - 1);
    return schedule[idx];
}
