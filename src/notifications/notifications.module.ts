import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Notification, NotificationSchema } from '../schema/notification.schema';
import { NotificationService } from './notifications.service';
import { EmailNotificationSender } from './email.sender';
import { WhatsAppNotificationSender } from './whatsapp.stub.sender';
import { NotificationsGateway } from './notifications.gateway';
import { AppConfigService } from '../config/app-config.service';
import { User, UserSchema } from '../schema/user.schema';
import { NotificationsCron } from '../common/cron/notifications.cron';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Notification.name, schema: NotificationSchema },
            { name: User.name, schema: UserSchema },
        ]),
    ],
    providers: [
        NotificationService,
        EmailNotificationSender,
        WhatsAppNotificationSender,
        NotificationsGateway,
        AppConfigService,
        NotificationsCron,
    ],
    exports: [NotificationService, NotificationsGateway],
})
export class NotificationsModule {}
