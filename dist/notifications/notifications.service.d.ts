import { Model, Types } from 'mongoose';
import { Notification, NotificationDocument } from '../schema/notification.schema';
import { NotificationContextType } from '../common/enums/notification.enum';
import { EmailNotificationSender } from './email.sender';
import { WhatsAppNotificationSender } from './whatsapp.stub.sender';
import { SendOptions } from '../common/interfaces/notification-sender.interface';
import { NotificationsGateway } from './notifications.gateway';
import { AppConfigService } from '../config/app-config.service';
import { UserDocument } from '../schema/user.schema';
import { ActionTokensService } from '../common/services/action-tokens.service';
import { ConversationStateService } from '../conversations/conversation-state.service';
import { SettingsService } from '../settings/settings.service';
export declare class NotificationService {
    private readonly notificationModel;
    private readonly userModel;
    private readonly emailSender;
    private readonly whatsappSender;
    private readonly notificationsGateway;
    private readonly config;
    private readonly settingsService;
    private readonly actionTokensService;
    private readonly conversationStateService;
    private readonly logger;
    constructor(notificationModel: Model<NotificationDocument>, userModel: Model<UserDocument>, emailSender: EmailNotificationSender, whatsappSender: WhatsAppNotificationSender, notificationsGateway: NotificationsGateway, config: AppConfigService, settingsService: SettingsService, actionTokensService: ActionTokensService, conversationStateService: ConversationStateService);
    send(options: Omit<SendOptions, 'contextType'> & {
        contextType: NotificationContextType;
    }): Promise<import("mongoose").Document<unknown, {}, Notification> & Notification & {
        _id: Types.ObjectId;
    } & Required<{
        _id: Types.ObjectId;
    }>>;
    processDueNotifications(now?: Date): Promise<void>;
    private getPrimaryChannel;
    private getFallbackChannel;
    private isWhatsAppAvailable;
    private dispatchNotification;
    private trySendInOrder;
    private trySend;
    private resolveEmailTemplateVariant;
    private emitInApp;
}
