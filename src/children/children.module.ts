import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChildrenController } from './children.controller';
import { ChildrenService } from './children.service';
import { User, UserSchema } from '../schema/user.schema';
import { ChildProfile, ChildProfileSchema } from '../schema/child-profile.schema';
import { MonitorProfile, MonitorProfileSchema } from '../schema/monitor-profile.schema';
import { Attendance, AttendanceSchema } from '../schema/attendance.schema';
import { Activity, ActivitySchema } from '../schema/activity.schema';
import { TownScopeService } from '../common/services/town-scope.service';
import { SettingsModule } from '../settings/settings.module';
import { MediaModule } from '../media/media.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { UsersModule } from '../users/users.module';
import { AppConfigService } from '../config/app-config.service';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: User.name, schema: UserSchema },
            { name: ChildProfile.name, schema: ChildProfileSchema },
            { name: MonitorProfile.name, schema: MonitorProfileSchema },
            { name: Attendance.name, schema: AttendanceSchema },
            { name: Activity.name, schema: ActivitySchema },
        ]),
        SettingsModule,
        MediaModule,
        NotificationsModule,
        UsersModule,
    ],
    controllers: [ChildrenController],
    providers: [ChildrenService, TownScopeService, AppConfigService],
    exports: [ChildrenService],
})
export class ChildrenModule {}
