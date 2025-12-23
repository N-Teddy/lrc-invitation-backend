import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AttendanceController } from './attendance.controller';
import { AttendanceService } from './attendance.service';
import { Attendance, AttendanceSchema } from '../schema/attendance.schema';
import { Activity, ActivitySchema } from '../schema/activity.schema';
import { User, UserSchema } from '../schema/user.schema';
import { ChildProfile, ChildProfileSchema } from '../schema/child-profile.schema';
import { Settings, SettingsSchema } from '../schema/settings.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Attendance.name, schema: AttendanceSchema },
            { name: Activity.name, schema: ActivitySchema },
            { name: User.name, schema: UserSchema },
            { name: ChildProfile.name, schema: ChildProfileSchema },
            { name: Settings.name, schema: SettingsSchema },
        ]),
    ],
    controllers: [AttendanceController],
    providers: [AttendanceService],
    exports: [AttendanceService],
})
export class AttendanceModule {}
