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

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Activity.name, schema: ActivitySchema },
            { name: User.name, schema: UserSchema },
            { name: ChildProfile.name, schema: ChildProfileSchema },
            { name: Attendance.name, schema: AttendanceSchema },
            { name: MonitorProfile.name, schema: MonitorProfileSchema },
        ]),
    ],
    controllers: [ActivitiesController],
    providers: [ActivitiesService, TownScopeService],
    exports: [ActivitiesService],
})
export class ActivitiesModule {}
