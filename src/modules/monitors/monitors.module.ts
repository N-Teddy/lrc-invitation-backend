import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MonitorsController } from './monitors.controller';
import { MonitorsService } from './monitors.service';
import { Monitor } from '../../entities/monitor.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Monitor])],
    controllers: [MonitorsController],
    providers: [MonitorsService],
    exports: [MonitorsService],
})
export class MonitorsModule { }
