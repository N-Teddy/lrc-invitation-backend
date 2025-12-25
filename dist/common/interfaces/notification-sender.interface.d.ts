import { NotificationContextType } from '../enums/notification.enum';
export interface NotificationAction {
    id: string;
    label: string;
    redirectUrl?: string;
}
export interface ConversationOptions {
    state: string;
    allowedResponses: string[];
    expiresAt: Date;
}
export interface SendOptions {
    userId: string;
    to: string;
    subject?: string;
    message: string;
    templateName?: string;
    templateData?: Record<string, any>;
    actions?: NotificationAction[];
    conversation?: ConversationOptions;
    contextType: NotificationContextType;
    contextId: string;
}
export interface NotificationSender {
    send(options: SendOptions): Promise<void>;
}
