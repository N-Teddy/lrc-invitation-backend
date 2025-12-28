import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { scheduleNextDailyRun } from '../utils/cron.util';
import { BirthdaysService } from '../../birthdays/birthdays.service';

@Injectable()
export class BirthdaysCron implements OnModuleInit {
    private readonly logger = new Logger(BirthdaysCron.name);

    constructor(private readonly birthdaysService: BirthdaysService) { }

    onModuleInit() {
        scheduleNextDailyRun(
            {
                hour: 7,
                minute: 30,
                timeZone: 'Africa/Douala',
            },
            async () => {
                try {
                    await this.birthdaysService.runDaily(new Date());
                } catch (err) {
                    this.logger.error(`Birthdays job failed: ${err?.message ?? err}`);
                }
            },
        );
    }
}
