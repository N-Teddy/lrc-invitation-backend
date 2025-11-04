import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContributionController } from './contribution.controller';
import { ContributionService } from './contribution.service';
import { MonitorContribution } from '../../entities/monitor-contribution.entity';
import { Monitor } from '../../entities/monitor.entity';
import { ConfigurationModule } from '../configuration/configuration.module';

@Module({
	imports: [TypeOrmModule.forFeature([MonitorContribution, Monitor]), ConfigurationModule],
	controllers: [ContributionController],
	providers: [ContributionService],
	exports: [ContributionService],
})
export class ContributionModule {}
