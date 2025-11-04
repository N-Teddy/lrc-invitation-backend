import { Controller, Post, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationService } from './notification.service';
import { ParticipationService } from '../participation/participation.service';
import { ActivityService } from '../activity/activity.service';
import { SendNotificationRequest } from '../../request/activity.request';
import { SuccessResponse } from '../../response/common.response';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { BusinessException } from '../../common/exceptions/business.exception';

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('activities/:activityId/notifications')
export class NotificationController {
	constructor(
		private readonly notificationService: NotificationService,
		private readonly participationService: ParticipationService,
		private readonly activityService: ActivityService
	) {}

	@Post('send')
	@ApiOperation({ summary: 'Send participant list notifications' })
	async sendNotifications(
		@Param('activityId') activityId: string,
		@Body() sendRequest: SendNotificationRequest
	): Promise<SuccessResponse> {
		const activity = await this.activityService.findOne(activityId);

		if (!activity.participantListGenerated) {
			throw new BusinessException('Participant list has not been generated yet');
		}

		const participantList = await this.participationService.getParticipantList(activityId);

		await this.notificationService.sendParticipantListNotifications(
			activityId,
			participantList,
			sendRequest.channel as any,
			activity.townId
		);

		return new SuccessResponse('Notifications sent successfully');
	}
}
