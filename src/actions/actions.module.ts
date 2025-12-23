import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppConfigService } from '../config/app-config.service';
import { ActionTokensService } from '../common/services/action-tokens.service';
import { ConversationsModule } from '../conversations/conversations.module';
import { ActionsController } from './actions.controller';
import { ActionsService } from './actions.service';
import { Notification, NotificationSchema } from '../schema/notification.schema';
import { User, UserSchema } from '../schema/user.schema';
import { Reminder, ReminderSchema } from '../schema/reminder.schema';
import { InteractionEvent, InteractionEventSchema } from '../schema/interaction-event.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Notification.name, schema: NotificationSchema },
            { name: User.name, schema: UserSchema },
            { name: Reminder.name, schema: ReminderSchema },
            { name: InteractionEvent.name, schema: InteractionEventSchema },
        ]),
        ConversationsModule,
    ],
    controllers: [ActionsController],
    providers: [ActionsService, ActionTokensService, AppConfigService],
})
export class ActionsModule {}
