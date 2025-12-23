import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ActivitiesController } from './activities.controller';
import { ActivitiesService } from './activities.service';
import { Activity, ActivitySchema } from '../schema/activity.schema';
import { User, UserSchema } from '../schema/user.schema';
import { ChildProfile, ChildProfileSchema } from '../schema/child-profile.schema';
import { Attendance, AttendanceSchema } from '../schema/attendance.schema';
import { MonitorProfile, MonitorProfileSchema } from '../schema/monitor-profile.schema';
import { TownScopeService } from '../common/services/town-scope.service';
import { JobsModule } from '../jobs/jobs.module';
import { RecipientsResolverService } from '../common/services/recipients-resolver.service';
import { ActivitiesInvitesCron } from '../common/cron/activities-invites.cron';
import { ActivitiesInvitesService } from './activities-invites.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { AppConfigService } from '../config/app-config.service';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Activity.name, schema: ActivitySchema },
            { name: User.name, schema: UserSchema },
            { name: ChildProfile.name, schema: ChildProfileSchema },
            { name: Attendance.name, schema: AttendanceSchema },
            { name: MonitorProfile.name, schema: MonitorProfileSchema },
        ]),
        JobsModule,
        NotificationsModule,
    ],
    controllers: [ActivitiesController],
    providers: [
        ActivitiesService,
        ActivitiesInvitesService,
        ActivitiesInvitesCron,
        TownScopeService,
        RecipientsResolverService,
        AppConfigService,
    ],
    exports: [ActivitiesService],
})
export class ActivitiesModule {}
