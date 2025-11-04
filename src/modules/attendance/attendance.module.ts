import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttendanceController } from './attendance.controller';
import { AttendanceService } from './attendance.service';
import { Attendance } from '../../entities/attendance.entity';
import { Activity } from '../../entities/activity.entity';
import { Monitor } from '../../entities/monitor.entity';
import { NotificationModule } from '../notification/notification.module';

@Module({
	imports: [TypeOrmModule.forFeature([Attendance, Activity, Monitor]), NotificationModule],
	controllers: [AttendanceController],
	providers: [AttendanceService],
	exports: [AttendanceService],
})
export class AttendanceModule {}
