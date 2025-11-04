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
import { ActivityService } from './activity.service';
import { CreateActivityRequest, UpdateActivityRequest } from '../../request/activity.request';
import { ActivityResponse } from '../../response/activity.response';
import { SuccessResponse } from '../../response/common.response';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Activities')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('activities')
export class ActivityController {
	constructor(private readonly activityService: ActivityService) {}

	@Post()
	@ApiOperation({ summary: 'Create a new activity' })
	@ApiResponse({ status: 201, description: 'Activity created successfully' })
	async create(
		@Body() createRequest: CreateActivityRequest
	): Promise<SuccessResponse<ActivityResponse>> {
		const activity = await this.activityService.create(createRequest);
		return new SuccessResponse('Activity created successfully', activity);
	}

	@Get()
	@ApiOperation({ summary: 'Get all activities' })
	@ApiQuery({ name: 'townId', required: false })
	@ApiQuery({ name: 'startDate', required: false })
	@ApiQuery({ name: 'endDate', required: false })
	async findAll(
		@Query('townId') townId?: string,
		@Query('startDate') startDate?: string,
		@Query('endDate') endDate?: string
	): Promise<SuccessResponse<ActivityResponse[]>> {
		const activities = await this.activityService.findAll(townId, startDate, endDate);
		return new SuccessResponse('Activities retrieved successfully', activities);
	}

	@Get(':id')
	@ApiOperation({ summary: 'Get an activity by ID' })
	async findOne(@Param('id') id: string): Promise<SuccessResponse<ActivityResponse>> {
		const activity = await this.activityService.findOne(id);
		return new SuccessResponse('Activity retrieved successfully', activity);
	}

	@Patch(':id')
	@ApiOperation({ summary: 'Update an activity' })
	async update(
		@Param('id') id: string,
		@Body() updateRequest: UpdateActivityRequest
	): Promise<SuccessResponse<ActivityResponse>> {
		const activity = await this.activityService.update(id, updateRequest);
		return new SuccessResponse('Activity updated successfully', activity);
	}

	@Delete(':id')
	@ApiOperation({ summary: 'Delete an activity' })
	async remove(@Param('id') id: string): Promise<SuccessResponse> {
		await this.activityService.remove(id);
		return new SuccessResponse('Activity deleted successfully');
	}
}
