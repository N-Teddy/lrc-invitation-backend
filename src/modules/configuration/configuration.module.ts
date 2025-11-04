import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigurationController } from './configuration.controller';
import { ConfigurationService } from './configuration.service';
import { SystemConfiguration } from '../../entities/system-configuration.entity';

@Module({
	imports: [TypeOrmModule.forFeature([SystemConfiguration])],
	controllers: [ConfigurationController],
	providers: [ConfigurationService],
	exports: [ConfigurationService],
})
export class ConfigurationModule {}
