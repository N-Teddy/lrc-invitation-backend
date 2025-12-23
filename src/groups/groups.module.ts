import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GroupsService } from './groups.service';
import { GroupsController } from './groups.controller';
import { User, UserSchema } from '../schema/user.schema';
import { ChildProfile, ChildProfileSchema } from '../schema/child-profile.schema';
import { MonitorProfile, MonitorProfileSchema } from '../schema/monitor-profile.schema';
import { Reminder, ReminderSchema } from '../schema/reminder.schema';
import { NotificationsModule } from '../notifications/notifications.module';
import { AppConfigService } from '../config/app-config.service';
import { GroupsCron } from '../common/cron/groups.cron';
import { RecipientsResolverService } from '../common/services/recipients-resolver.service';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: User.name, schema: UserSchema },
            { name: ChildProfile.name, schema: ChildProfileSchema },
            { name: MonitorProfile.name, schema: MonitorProfileSchema },
            { name: Reminder.name, schema: ReminderSchema },
        ]),
        NotificationsModule,
    ],
    providers: [GroupsService, GroupsCron, AppConfigService, RecipientsResolverService],
    controllers: [GroupsController],
    exports: [GroupsService],
})
export class GroupsModule {}
