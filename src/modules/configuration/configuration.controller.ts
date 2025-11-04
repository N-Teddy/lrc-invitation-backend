import { Controller, Get, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ConfigurationService } from './configuration.service';
import { UpdateConfigurationRequest } from '../../request/configuration.request';
import { SuccessResponse } from '../../response/common.response';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { SystemConfiguration } from '../../entities/system-configuration.entity';

@ApiTags('Configuration')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('configuration')
export class ConfigurationController {
	constructor(private readonly configurationService: ConfigurationService) {}

	@Get()
	@ApiOperation({ summary: 'Get all system configurations' })
	async findAll(): Promise<SuccessResponse<SystemConfiguration[]>> {
		const configs = await this.configurationService.findAll();
		return new SuccessResponse('Configurations retrieved successfully', configs);
	}

	@Get(':key')
	@ApiOperation({ summary: 'Get a configuration by key' })
	async findByKey(@Param('key') key: string): Promise<SuccessResponse<SystemConfiguration>> {
		const config = await this.configurationService.findByKey(key);
		return new SuccessResponse('Configuration retrieved successfully', config);
	}

	@Patch(':key')
	@Roles(Role.DEV, Role.SUPER_MONITOR)
	@ApiOperation({ summary: 'Update a configuration' })
	async update(
		@Param('key') key: string,
		@Body() updateRequest: UpdateConfigurationRequest
	): Promise<SuccessResponse<SystemConfiguration>> {
		const config = await this.configurationService.update(key, updateRequest);
		return new SuccessResponse('Configuration updated successfully', config);
	}
}
