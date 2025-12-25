import { OnModuleInit } from '@nestjs/common';
import { ActivitiesInvitesService } from '../../activities/activities-invites.service';
export declare class ActivitiesInvitesCron implements OnModuleInit {
    private readonly invitesService;
    private readonly logger;
    constructor(invitesService: ActivitiesInvitesService);
    onModuleInit(): void;
}
