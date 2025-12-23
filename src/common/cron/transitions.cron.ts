import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { scheduleNextDailyRun } from '../utils/cron.util';
import { ReportingService } from '../../reporting/reporting.service';

@Injectable()
export class TransitionsCron implements OnModuleInit {
    private readonly logger = new Logger(TransitionsCron.name);

    constructor(private readonly reportingService: ReportingService) {}

    onModuleInit() {
        scheduleNextDailyRun(
            {
                hour: 8,
                minute: 30,
                timeZone: 'Africa/Douala',
            },
            async () => {
                try {
                    await this.reportingService.sendTurning19YearlyReport(new Date());
                } catch (err) {
                    this.logger.error(`Transitions job failed: ${err?.message ?? err}`);
                }
            },
        );
    }
}
