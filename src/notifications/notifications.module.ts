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
import { ConversationsModule } from '../conversations/conversations.module';
import { ActionTokensService } from '../common/services/action-tokens.service';
import { NotificationsController } from './notifications.controller';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Notification.name, schema: NotificationSchema },
            { name: User.name, schema: UserSchema },
        ]),
        ConversationsModule,
    ],
    controllers: [NotificationsController],
    providers: [
        NotificationService,
        EmailNotificationSender,
        WhatsAppNotificationSender,
        NotificationsGateway,
        AppConfigService,
        ActionTokensService,
        NotificationsCron,
    ],
    exports: [NotificationService, NotificationsGateway],
})
export class NotificationsModule {}
