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
import { MonitorService } from './monitor.service';
import { CreateMonitorRequest, UpdateMonitorRequest } from '../../request/monitor.request';
import { MonitorResponse } from '../../response/monitor.response';
import { SuccessResponse } from '../../response/common.response';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';

@ApiTags('Monitors')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('monitors')
export class MonitorController {
	constructor(private readonly monitorService: MonitorService) {}

	@Post()
	@Roles(Role.DEV, Role.SUPER_MONITOR)
	@ApiOperation({ summary: 'Create a new monitor' })
	@ApiResponse({ status: 201, description: 'Monitor created successfully' })
	async create(
		@Body() createRequest: CreateMonitorRequest
	): Promise<SuccessResponse<MonitorResponse>> {
		const monitor = await this.monitorService.create(createRequest);
		return new SuccessResponse('Monitor created successfully', monitor);
	}

	@Get()
	@ApiOperation({ summary: 'Get all monitors' })
	@ApiQuery({ name: 'townId', required: false })
	async findAll(@Query('townId') townId?: string): Promise<SuccessResponse<MonitorResponse[]>> {
		const monitors = await this.monitorService.findAll(townId);
		return new SuccessResponse('Monitors retrieved successfully', monitors);
	}

	@Get(':id')
	@ApiOperation({ summary: 'Get a monitor by ID' })
	async findOne(@Param('id') id: string): Promise<SuccessResponse<MonitorResponse>> {
		const monitor = await this.monitorService.findOne(id);
		return new SuccessResponse('Monitor retrieved successfully', monitor);
	}

	@Patch(':id')
	@Roles(Role.DEV, Role.SUPER_MONITOR)
	@ApiOperation({ summary: 'Update a monitor' })
	async update(
		@Param('id') id: string,
		@Body() updateRequest: UpdateMonitorRequest
	): Promise<SuccessResponse<MonitorResponse>> {
		const monitor = await this.monitorService.update(id, updateRequest);
		return new SuccessResponse('Monitor updated successfully', monitor);
	}

	@Delete(':id')
	@Roles(Role.DEV, Role.SUPER_MONITOR)
	@ApiOperation({ summary: 'Delete a monitor (soft delete)' })
	async remove(@Param('id') id: string): Promise<SuccessResponse> {
		await this.monitorService.remove(id);
		return new SuccessResponse('Monitor deleted successfully');
	}
}
