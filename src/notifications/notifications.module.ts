import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Notification, NotificationSchema } from '../schema/notification.schema';
import { NotificationService } from './notifications.service';
import { EmailNotificationSender } from './email.sender';
import { WhatsAppNotificationSender } from './whatsapp.stub.sender';
import { NotificationsGateway } from './notifications.gateway';
import { AppConfigService } from '../config/app-config.service';

@Module({
    imports: [MongooseModule.forFeature([{ name: Notification.name, schema: NotificationSchema }])],
    providers: [
        NotificationService,
        EmailNotificationSender,
        WhatsAppNotificationSender,
        NotificationsGateway,
        AppConfigService,
    ],
    exports: [NotificationService, NotificationsGateway],
})
export class NotificationsModule {}
