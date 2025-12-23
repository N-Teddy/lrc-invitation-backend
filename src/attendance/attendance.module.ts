import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AttendanceController } from './attendance.controller';
import { AttendanceService } from './attendance.service';
import { Attendance, AttendanceSchema } from '../schema/attendance.schema';
import { Activity, ActivitySchema } from '../schema/activity.schema';
import { User, UserSchema } from '../schema/user.schema';
import { ChildProfile, ChildProfileSchema } from '../schema/child-profile.schema';
import { ReportingModule } from '../reporting/reporting.module';
import { MonitorProfile, MonitorProfileSchema } from '../schema/monitor-profile.schema';
import { TownScopeService } from '../common/services/town-scope.service';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Attendance.name, schema: AttendanceSchema },
            { name: Activity.name, schema: ActivitySchema },
            { name: User.name, schema: UserSchema },
            { name: ChildProfile.name, schema: ChildProfileSchema },
            { name: MonitorProfile.name, schema: MonitorProfileSchema },
        ]),
        ReportingModule,
    ],
    controllers: [AttendanceController],
    providers: [AttendanceService, TownScopeService],
    exports: [AttendanceService],
})
export class AttendanceModule {}
