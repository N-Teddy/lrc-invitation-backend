import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { scheduleEveryMs } from '../utils/cron.util';
import { RemindersService } from '../../reminders/reminders.service';

@Injectable()
export class RemindersCron implements OnModuleInit {
    private readonly logger = new Logger(RemindersCron.name);

    constructor(private readonly remindersService: RemindersService) {}

    onModuleInit() {
        // Poll for due reminders (lightweight) to avoid adding scheduling dependencies.
        scheduleEveryMs(
            60_000,
            async () => {
                try {
                    await this.remindersService.processDueReminders(new Date());
                } catch (err) {
                    this.logger.error(`Reminder processing failed: ${err?.message ?? err}`);
                }
            },
            { initialDelayMs: 5000 },
        );
    }
}
