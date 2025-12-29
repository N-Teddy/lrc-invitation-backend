import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { scheduleEveryMs } from '../utils/cron.util';
import { ReportingService } from '../../reporting/reporting.service';

@Injectable()
export class AttendanceWarningCron implements OnModuleInit {
    private readonly logger = new Logger(AttendanceWarningCron.name);

    constructor(private readonly reportingService: ReportingService) {}

    onModuleInit() {
        scheduleEveryMs(
            30 * 60_000,
            async () => {
                try {
                    await this.reportingService.warnMissingAttendance(new Date());
                } catch (err) {
                    this.logger.error(`Attendance warning job failed: ${err?.message ?? err}`);
                }
            },
            { initialDelayMs: 10_000 },
        );
    }
}
