import { Controller, Get, Post, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ContributionService } from './contribution.service';
import { RecordPaymentRequest } from '../../request/contribution.request';
import { SuccessResponse } from '../../response/common.response';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { MonitorContribution } from '../../entities/monitor-contribution.entity';

@ApiTags('Contributions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('contributions')
export class ContributionController {
	constructor(private readonly contributionService: ContributionService) {}

	@Get('monitors/:monitorId')
	@ApiOperation({ summary: 'Get contributions for a specific monitor' })
	@ApiQuery({ name: 'year', required: false })
	async getMonitorContributions(
		@Param('monitorId') monitorId: string,
		@Query('year') year?: number
	): Promise<SuccessResponse<MonitorContribution[]>> {
		const contributions = await this.contributionService.getMonitorContributions(
			monitorId,
			year ? parseInt(year.toString()) : undefined
		);
		return new SuccessResponse('Contributions retrieved successfully', contributions);
	}

	@Post('monitors/:monitorId/payments')
	@ApiOperation({ summary: 'Record a payment for a monitor' })
	@ApiQuery({ name: 'year', required: true })
	async recordPayment(
		@Param('monitorId') monitorId: string,
		@Query('year') year: number,
		@Body() paymentRequest: RecordPaymentRequest
	): Promise<SuccessResponse<MonitorContribution>> {
		const contribution = await this.contributionService.recordPayment(
			monitorId,
			parseInt(year.toString()),
			paymentRequest
		);
		return new SuccessResponse('Payment recorded successfully', contribution);
	}

	@Get()
	@Roles(Role.DEV, Role.SUPER_MONITOR)
	@ApiOperation({ summary: 'Get all contributions' })
	@ApiQuery({ name: 'year', required: false })
	async getAllContributions(
		@Query('year') year?: number
	): Promise<SuccessResponse<MonitorContribution[]>> {
		const contributions = await this.contributionService.getAllContributions(
			year ? parseInt(year.toString()) : undefined
		);
		return new SuccessResponse('Contributions retrieved successfully', contributions);
	}

	@Post('initialize/:year')
	@Roles(Role.DEV, Role.SUPER_MONITOR)
	@ApiOperation({ summary: 'Initialize yearly contributions for all monitors' })
	async initializeYearlyContributions(@Param('year') year: number): Promise<SuccessResponse> {
		await this.contributionService.initializeYearlyContributions(parseInt(year.toString()));
		return new SuccessResponse('Yearly contributions initialized successfully');
	}

	@Get('summary/:year')
	@Roles(Role.DEV, Role.SUPER_MONITOR)
	@ApiOperation({ summary: 'Get contribution summary for a year' })
	async getContributionSummary(@Param('year') year: number): Promise<SuccessResponse> {
		const summary = await this.contributionService.getContributionSummary(
			parseInt(year.toString())
		);
		return new SuccessResponse('Summary retrieved successfully', summary);
	}
}
