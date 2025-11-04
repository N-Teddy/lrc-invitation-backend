import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivityController } from './activity.controller';
import { ActivityService } from './activity.service';
import { Activity } from '../../entities/activity.entity';
import { ActivityTargetGroup } from '../../entities/activity-target-group.entity';

@Module({
	imports: [TypeOrmModule.forFeature([Activity, ActivityTargetGroup])],
	controllers: [ActivityController],
	providers: [ActivityService],
	exports: [ActivityService],
})
export class ActivityModule {}
