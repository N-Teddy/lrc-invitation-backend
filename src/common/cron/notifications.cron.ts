import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { scheduleEveryMs } from '../utils/cron.util';
import { NotificationService } from '../../notifications/notifications.service';

@Injectable()
export class NotificationsCron implements OnModuleInit {
    private readonly logger = new Logger(NotificationsCron.name);

    constructor(private readonly notificationService: NotificationService) {}

    onModuleInit() {
        scheduleEveryMs(
            60_000,
            async () => {
                try {
                    await this.notificationService.processDueNotifications(new Date());
                } catch (err) {
                    this.logger.error(
                        `Notification retry processing failed: ${err?.message ?? err}`,
                    );
                }
            },
            { initialDelayMs: 5000 },
        );
    }
}
