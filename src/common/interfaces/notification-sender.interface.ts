import { NotificationContextType } from '../enums/notification.enum';

export interface SendOptions {
    userId: string;
    to: string;
    subject?: string;
    message: string;
    templateName?: string;
    templateData?: Record<string, any>;
    contextType: NotificationContextType;
    contextId: string;
}

export interface NotificationSender {
    send(options: SendOptions): Promise<void>;
}
