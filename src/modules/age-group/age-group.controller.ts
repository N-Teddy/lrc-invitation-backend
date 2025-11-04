import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AgeGroupService } from './age-group.service';
import { SuccessResponse } from '../../response/common.response';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AgeGroup } from '../../entities/age-group.entity';

@ApiTags('Age Groups')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('age-groups')
export class AgeGroupController {
	constructor(private readonly ageGroupService: AgeGroupService) {}

	@Get()
	@ApiOperation({ summary: 'Get all age groups' })
	async findAll(): Promise<SuccessResponse<AgeGroup[]>> {
		const ageGroups = await this.ageGroupService.findAll();
		return new SuccessResponse('Age groups retrieved successfully', ageGroups);
	}

	@Get(':id')
	@ApiOperation({ summary: 'Get an age group by ID' })
	async findOne(@Param('id') id: string): Promise<SuccessResponse<AgeGroup>> {
		const ageGroup = await this.ageGroupService.findOne(id);
		return new SuccessResponse('Age group retrieved successfully', ageGroup);
	}
}
