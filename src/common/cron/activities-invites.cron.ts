import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { scheduleNextDailyRun } from '../utils/cron.util';
import { ActivitiesInvitesService } from '../../activities/activities-invites.service';

@Injectable()
export class ActivitiesInvitesCron implements OnModuleInit {
    private readonly logger = new Logger(ActivitiesInvitesCron.name);

    constructor(private readonly invitesService: ActivitiesInvitesService) {}

    onModuleInit() {
        scheduleNextDailyRun(
            {
                hour: 8,
                minute: 0,
                timeZone: 'Africa/Douala',
            },
            async () => {
                try {
                    await this.invitesService.runDaily(new Date());
                } catch (err) {
                    this.logger.error(`3-weeks invites job failed: ${err?.message ?? err}`);
                }
            },
        );
    }
}
