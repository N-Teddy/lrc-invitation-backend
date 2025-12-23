import { NotificationContextType } from '../enums/notification.enum';

export interface SendOptions {
    userId: string;
    to: string;
    subject?: string;
    message: string;
    contextType: NotificationContextType;
    contextId: string;
}

export interface NotificationSender {
    send(options: SendOptions): Promise<void>;
}
