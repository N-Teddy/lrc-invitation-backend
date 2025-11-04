import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ParticipationService } from './participation.service';
import { ParticipantListResponse } from '../../response/participant.response';
import { SuccessResponse } from '../../response/common.response';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Participation')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('activities/:activityId/participants')
export class ParticipationController {
	constructor(private readonly participationService: ParticipationService) {}

	@Post('generate')
	@ApiOperation({ summary: 'Generate participant list for an activity' })
	async generateList(
		@Param('activityId') activityId: string
	): Promise<SuccessResponse<ParticipantListResponse>> {
		const list = await this.participationService.generateParticipantList(activityId);
		return new SuccessResponse('Participant list generated successfully', list);
	}

	@Get()
	@ApiOperation({ summary: 'Get participant list for an activity' })
	async getList(
		@Param('activityId') activityId: string
	): Promise<SuccessResponse<ParticipantListResponse>> {
		const list = await this.participationService.getParticipantList(activityId);
		return new SuccessResponse('Participant list retrieved successfully', list);
	}
}
