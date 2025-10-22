import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivitiesController } from './activities.controller';
import { ActivitiesService } from './activities.service';
import { Activity } from '../../entities/activity.entity';
import { Monitor } from '../../entities/monitor.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Activity, Monitor])],
    controllers: [ActivitiesController],
    providers: [ActivitiesService],
    exports: [ActivitiesService],
})
export class ActivitiesModule { }
