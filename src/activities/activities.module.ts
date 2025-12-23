import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ActivitiesController } from './activities.controller';
import { ActivitiesService } from './activities.service';
import { Activity, ActivitySchema } from '../schema/activity.schema';
import { Settings, SettingsSchema } from '../schema/settings.schema';
import { User, UserSchema } from '../schema/user.schema';
import { ChildProfile, ChildProfileSchema } from '../schema/child-profile.schema';
import { Attendance, AttendanceSchema } from '../schema/attendance.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Activity.name, schema: ActivitySchema },
            { name: Settings.name, schema: SettingsSchema },
            { name: User.name, schema: UserSchema },
            { name: ChildProfile.name, schema: ChildProfileSchema },
            { name: Attendance.name, schema: AttendanceSchema },
        ]),
    ],
    controllers: [ActivitiesController],
    providers: [ActivitiesService],
    exports: [ActivitiesService],
})
export class ActivitiesModule {}
