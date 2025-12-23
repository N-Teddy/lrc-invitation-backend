import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReportingController } from './reporting.controller';
import { ReportingService } from './reporting.service';
import { Activity, ActivitySchema } from '../schema/activity.schema';
import { Attendance, AttendanceSchema } from '../schema/attendance.schema';
import { User, UserSchema } from '../schema/user.schema';
import { NotificationsModule } from '../notifications/notifications.module';
import { MonitorProfile, MonitorProfileSchema } from '../schema/monitor-profile.schema';
import { TownScopeService } from '../common/services/town-scope.service';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Activity.name, schema: ActivitySchema },
            { name: Attendance.name, schema: AttendanceSchema },
            { name: User.name, schema: UserSchema },
            { name: MonitorProfile.name, schema: MonitorProfileSchema },
        ]),
        NotificationsModule,
    ],
    controllers: [ReportingController],
    providers: [ReportingService, TownScopeService],
    exports: [ReportingService],
})
export class ReportingModule {}
