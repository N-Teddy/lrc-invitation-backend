import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MonitorController } from './monitor.controller';
import { MonitorService } from './monitor.service';
import { Monitor } from '../../entities/monitor.entity';

@Module({
	imports: [TypeOrmModule.forFeature([Monitor])],
	controllers: [MonitorController],
	providers: [MonitorService],
	exports: [MonitorService],
})
export class MonitorModule {}
