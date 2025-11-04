import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChildController } from './child.controller';
import { ChildService } from './child.service';
import { Child } from '../../entities/child.entity';
import { AgeGroup } from '../../entities/age-group.entity';

@Module({
	imports: [TypeOrmModule.forFeature([Child, AgeGroup])],
	controllers: [ChildController],
	providers: [ChildService],
	exports: [ChildService],
})
export class ChildModule {}
