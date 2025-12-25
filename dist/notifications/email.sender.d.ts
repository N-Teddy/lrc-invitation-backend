import { NotificationSender, SendOptions } from '../common/interfaces/notification-sender.interface';
import { AppConfigService } from '../config/app-config.service';
export declare class EmailNotificationSender implements NotificationSender {
    private readonly config;
    private readonly logger;
    private readonly transporter;
    constructor(config: AppConfigService);
    send(options: SendOptions): Promise<void>;
}
