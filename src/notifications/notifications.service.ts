import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification, NotificationDocument } from '../schema/notification.schema';
import {
    Channel,
    NotificationContextType,
    NotificationStatus,
} from '../common/enums/notification.enum';
import { EmailNotificationSender } from './email.sender';
import { WhatsAppNotificationSender } from './whatsapp.stub.sender';
import { SendOptions } from '../common/interfaces/notification-sender.interface';
import { NotificationsGateway } from './notifications.gateway';
import { AppConfigService } from '../config/app-config.service';

@Injectable()
export class NotificationService {
    private readonly provider: Channel;

    constructor(
        @InjectModel(Notification.name)
        private readonly notificationModel: Model<NotificationDocument>,
        private readonly emailSender: EmailNotificationSender,
        private readonly whatsappSender: WhatsAppNotificationSender,
        private readonly notificationsGateway: NotificationsGateway,
        private readonly config: AppConfigService,
    ) {
        const provider = this.config.notificationProvider;
        this.provider = provider === 'whatsapp' ? Channel.WhatsApp : Channel.Email;
    }

    async send(
        options: Omit<SendOptions, 'contextType'> & { contextType: NotificationContextType },
    ) {
        const notif = new this.notificationModel({
            channel: this.provider,
            toUserId: options.userId,
            contextType: options.contextType,
            contextId: options.contextId,
            status: NotificationStatus.Queued,
            templateName: options.subject,
            templateLanguage: options.subject,
            languageUsed: options.subject,
            interactiveOptions: [],
        });
        await notif.save();

        try {
            if (this.provider === Channel.Email) {
                await this.emailSender.send(options);
            } else {
                await this.whatsappSender.send(options);
            }
            await this.notificationModel.findByIdAndUpdate(notif._id, {
                status: NotificationStatus.Sent,
                sentAt: new Date(),
                languageUsed: options.subject,
            });
            this.notificationsGateway.emitToUser(options.userId, 'notification', {
                contextType: options.contextType,
                contextId: options.contextId,
                message: options.message,
            });
        } catch (err) {
            await this.notificationModel.findByIdAndUpdate(notif._id, {
                status: NotificationStatus.Failed,
                error: err?.message ?? String(err),
            });
            throw err;
        }
    }
}
