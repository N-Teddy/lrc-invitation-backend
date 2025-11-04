import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgeGroupController } from './age-group.controller';
import { AgeGroupService } from './age-group.service';
import { AgeGroup } from '../../entities/age-group.entity';

@Module({
	imports: [TypeOrmModule.forFeature([AgeGroup])],
	controllers: [AgeGroupController],
	providers: [AgeGroupService],
	exports: [AgeGroupService],
})
export class AgeGroupModule {}
