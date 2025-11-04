import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TownController } from './town.controller';
import { TownService } from './town.service';
import { Town } from '../../entities/town.entity';

@Module({
	imports: [TypeOrmModule.forFeature([Town])],
	controllers: [TownController],
	providers: [TownService],
	exports: [TownService],
})
export class TownModule {}
