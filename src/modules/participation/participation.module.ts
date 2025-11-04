import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ParticipationController } from './participation.controller';
import { ParticipationService } from './participation.service';
import { Participant } from '../../entities/participant.entity';
import { Child } from '../../entities/child.entity';
import { Activity } from '../../entities/activity.entity';
import { Attendance } from '../../entities/attendance.entity';
import { AgeGroup } from '../../entities/age-group.entity';
import { ConfigurationModule } from '../configuration/configuration.module';

@Module({
	imports: [
		TypeOrmModule.forFeature([Participant, Child, Activity, Attendance, AgeGroup]),
		ConfigurationModule,
	],
	controllers: [ParticipationController],
	providers: [ParticipationService],
	exports: [ParticipationService],
})
export class ParticipationModule {}
