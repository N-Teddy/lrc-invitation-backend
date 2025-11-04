import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TownService } from './town.service';
import { SuccessResponse } from '../../response/common.response';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Town } from '../../entities/town.entity';

@ApiTags('Towns')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('towns')
export class TownController {
	constructor(private readonly townService: TownService) {}

	@Get()
	@ApiOperation({ summary: 'Get all towns' })
	async findAll(): Promise<SuccessResponse<Town[]>> {
		const towns = await this.townService.findAll();
		return new SuccessResponse('Towns retrieved successfully', towns);
	}

	@Get(':id')
	@ApiOperation({ summary: 'Get a town by ID' })
	async findOne(@Param('id') id: string): Promise<SuccessResponse<Town>> {
		const town = await this.townService.findOne(id);
		return new SuccessResponse('Town retrieved successfully', town);
	}
}
