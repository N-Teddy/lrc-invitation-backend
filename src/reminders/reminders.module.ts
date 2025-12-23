import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RemindersController } from './reminders.controller';
import { RemindersService } from './reminders.service';
import { Reminder, ReminderSchema } from '../schema/reminder.schema';
import { User, UserSchema } from '../schema/user.schema';
import { NotificationsModule } from '../notifications/notifications.module';
import { AppConfigService } from '../config/app-config.service';
import { RemindersCron } from '../common/cron/reminders.cron';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Reminder.name, schema: ReminderSchema },
            { name: User.name, schema: UserSchema },
        ]),
        NotificationsModule,
    ],
    controllers: [RemindersController],
    providers: [RemindersService, RemindersCron, AppConfigService],
    exports: [RemindersService],
})
export class RemindersModule {}
