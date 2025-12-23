import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { GroupsService } from '../../groups/groups.service';
import { scheduleNextDailyRun } from '../utils/cron.util';

@Injectable()
export class GroupsCron implements OnModuleInit {
    private readonly logger = new Logger(GroupsCron.name);

    constructor(private readonly groupsService: GroupsService) {}

    onModuleInit() {
        scheduleNextDailyRun(
            {
                hour: 2,
                minute: 0,
                timeZone: 'Africa/Douala',
            },
            async () => {
                try {
                    await this.groupsService.recomputeAllChildren(new Date());
                } catch (err) {
                    this.logger.error(`Group recompute failed: ${err?.message ?? err}`);
                }
            },
        );
    }
}
