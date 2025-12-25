import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RemindersController } from './reminders.controller';
import { RemindersService } from './reminders.service';
import { Reminder, ReminderSchema } from '../schema/reminder.schema';
import { User, UserSchema } from '../schema/user.schema';
import { MonitorProfile, MonitorProfileSchema } from '../schema/monitor-profile.schema';
import { InteractionEvent, InteractionEventSchema } from '../schema/interaction-event.schema';
import { NotificationsModule } from '../notifications/notifications.module';
import { AppConfigService } from '../config/app-config.service';
import { RemindersCron } from '../common/cron/reminders.cron';
import { TownScopeService } from '../common/services/town-scope.service';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Reminder.name, schema: ReminderSchema },
            { name: User.name, schema: UserSchema },
            { name: MonitorProfile.name, schema: MonitorProfileSchema },
            { name: InteractionEvent.name, schema: InteractionEventSchema },
        ]),
        NotificationsModule,
    ],
    controllers: [RemindersController],
    providers: [RemindersService, RemindersCron, AppConfigService, TownScopeService],
    exports: [RemindersService],
})
export class RemindersModule {}
