import { OnModuleInit } from '@nestjs/common';
import { NotificationService } from '../../notifications/notifications.service';
export declare class NotificationsCron implements OnModuleInit {
    private readonly notificationService;
    private readonly logger;
    constructor(notificationService: NotificationService);
    onModuleInit(): void;
}
