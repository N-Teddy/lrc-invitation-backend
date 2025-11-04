import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
	UseGuards,
	Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ChildService } from './child.service';
import { CreateChildRequest, UpdateChildRequest } from '../../request/child.request';
import { ChildResponse } from '../../response/child.response';
import { SuccessResponse } from '../../response/common.response';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Children')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('children')
export class ChildController {
	constructor(private readonly childService: ChildService) {}

	@Post()
	@ApiOperation({ summary: 'Register a new child' })
	@ApiResponse({ status: 201, description: 'Child registered successfully' })
	async create(
		@Body() createRequest: CreateChildRequest
	): Promise<SuccessResponse<ChildResponse>> {
		const child = await this.childService.create(createRequest);
		return new SuccessResponse('Child registered successfully', child);
	}

	@Get()
	@ApiOperation({ summary: 'Get all children' })
	@ApiQuery({ name: 'townId', required: false })
	@ApiQuery({ name: 'ageGroupId', required: false })
	async findAll(
		@Query('townId') townId?: string,
		@Query('ageGroupId') ageGroupId?: string
	): Promise<SuccessResponse<ChildResponse[]>> {
		const children = await this.childService.findAll(townId, ageGroupId);
		return new SuccessResponse('Children retrieved successfully', children);
	}

	@Get(':id')
	@ApiOperation({ summary: 'Get a child by ID' })
	async findOne(@Param('id') id: string): Promise<SuccessResponse<ChildResponse>> {
		const child = await this.childService.findOne(id);
		return new SuccessResponse('Child retrieved successfully', child);
	}

	@Patch(':id')
	@ApiOperation({ summary: 'Update a child' })
	async update(
		@Param('id') id: string,
		@Body() updateRequest: UpdateChildRequest
	): Promise<SuccessResponse<ChildResponse>> {
		const child = await this.childService.update(id, updateRequest);
		return new SuccessResponse('Child updated successfully', child);
	}

	@Delete(':id')
	@ApiOperation({ summary: 'Delete a child (soft delete)' })
	async remove(@Param('id') id: string): Promise<SuccessResponse> {
		await this.childService.remove(id);
		return new SuccessResponse('Child deleted successfully');
	}
}
