import { NotificationSender, SendOptions } from '../common/interfaces/notification-sender.interface';
export declare class WhatsAppNotificationSender implements NotificationSender {
    private readonly logger;
    send(options: SendOptions): Promise<void>;
}
