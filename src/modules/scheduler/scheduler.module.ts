import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SchedulerService } from './scheduler.service';
import { ActivityModule } from '../activity/activity.module';
import { ParticipationModule } from '../participation/participation.module';
import { NotificationModule } from '../notification/notification.module';
import { ChildModule } from '../child/child.module';
import { ConfigurationModule } from '../configuration/configuration.module';
import { Monitor } from '../../entities/monitor.entity';

@Module({
	imports: [
		ScheduleModule.forRoot(),
		TypeOrmModule.forFeature([Monitor]),
		ActivityModule,
		ParticipationModule,
		NotificationModule,
		ChildModule,
		ConfigurationModule,
	],
	providers: [SchedulerService],
})
export class SchedulerModule {}
