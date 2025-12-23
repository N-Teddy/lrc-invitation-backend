import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReportingController } from './reporting.controller';
import { ReportingService } from './reporting.service';
import { Activity, ActivitySchema } from '../schema/activity.schema';
import { Attendance, AttendanceSchema } from '../schema/attendance.schema';
import { User, UserSchema } from '../schema/user.schema';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Activity.name, schema: ActivitySchema },
            { name: Attendance.name, schema: AttendanceSchema },
            { name: User.name, schema: UserSchema },
        ]),
        NotificationsModule,
    ],
    controllers: [ReportingController],
    providers: [ReportingService],
    exports: [ReportingService],
})
export class ReportingModule {}
