import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttendanceController } from './attendance.controller';
import { AttendanceService } from './attendance.service';
import { Attendance } from '../../entities/attendance.entity';
import { Child } from '../../entities/child.entity';
import { Activity } from '../../entities/activity.entity';
import { Monitor } from '../../entities/monitor.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Attendance, Child, Activity, Monitor])],
    controllers: [AttendanceController],
    providers: [AttendanceService],
    exports: [AttendanceService],
})
export class AttendanceModule { }
