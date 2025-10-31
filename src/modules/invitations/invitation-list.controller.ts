import {
    Controller,
    Get,
    Post,
    Param,
    Query,
    Body,
    UseGuards,
    ParseIntPipe,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiQuery,
} from '@nestjs/swagger';
import { InvitationListService } from './invitation-list.service';
import { NotificationService } from './notification.service';
import { RecipientService } from './recipient.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { SendInvitationListDto, SendMethod } from '../../dto/request/send-invitation-list.dto';

@ApiTags('Invitation Lists')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('invitation-lists')
export class InvitationListController {
    constructor(
        private readonly invitationListService: InvitationListService,
        private readonly notificationService: NotificationService,
        private readonly recipientService: RecipientService,
    ) { }

    @Get('activities/:activityId')
    @Roles(Role.DEV, Role.ADMIN, Role.CHIEF_MONITOR, Role.MONITOR)
    @ApiOperation({ summary: 'Generate invitation list for an activity' })
    @ApiResponse({ status: 200, description: 'Invitation list generated successfully' })
    @ApiResponse({ status: 404, description: 'Activity not found' })
    async generateList(@Param('activityId', ParseIntPipe) activityId: number) {
        return this.invitationListService.generateInvitationList(activityId);
    }

    @Get('upcoming')
    @Roles(Role.DEV, Role.ADMIN, Role.CHIEF_MONITOR)
    @ApiOperation({ summary: 'Generate invitation lists for upcoming activities (2-3 weeks)' })
    @ApiResponse({ status: 200, description: 'Invitation lists generated successfully' })
    async generateUpcoming() {
        return this.invitationListService.generateUpcomingInvitations();
    }

    @Post('activities/:activityId/send')
    @Roles(Role.DEV, Role.ADMIN, Role.CHIEF_MONITOR)
    @ApiOperation({ summary: 'Send invitation list to configured recipients' })
    @ApiResponse({ status: 200, description: 'Invitation list sent successfully' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @ApiResponse({ status: 404, description: 'Activity not found' })
    async sendList(
        @Param('activityId', ParseIntPipe) activityId: number,
        @Body() sendDto: SendInvitationListDto,
    ) {
        const invitationList = await this.invitationListService.generateInvitationList(
            activityId,
        );
        const recipients = await this.recipientService.getInvitationRecipients(activityId);

        const method = sendDto.method || SendMethod.WHATSAPP;

        return this.notificationService.sendInvitationList({
            activityId,
            invitationList,
            recipients,
            method,
            customMessage: sendDto.customMessage,
        });
    }

    @Get('activities/:activityId/logs')
    @Roles(Role.DEV, Role.ADMIN, Role.CHIEF_MONITOR)
    @ApiOperation({ summary: 'Get delivery logs for an activity' })
    @ApiResponse({ status: 200, description: 'Logs retrieved successfully' })
    async getSendLogs(@Param('activityId', ParseIntPipe) activityId: number) {
        return this.notificationService.getSendLogs(activityId);
    }

    @Get('logs/recent')
    @Roles(Role.DEV, Role.ADMIN, Role.CHIEF_MONITOR)
    @ApiOperation({ summary: 'Get recent delivery logs' })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiResponse({ status: 200, description: 'Recent logs retrieved successfully' })
    async getRecentLogs(@Query('limit') limit?: number) {
        return this.notificationService.getRecentLogs(limit ? parseInt(limit.toString()) : 50);
    }

    @Get('logs/failed')
    @Roles(Role.DEV, Role.ADMIN, Role.CHIEF_MONITOR)
    @ApiOperation({ summary: 'Get failed delivery logs' })
    @ApiQuery({ name: 'activityId', required: false, type: Number })
    @ApiResponse({ status: 200, description: 'Failed logs retrieved successfully' })
    async getFailedLogs(@Query('activityId') activityId?: number) {
        return this.notificationService.getFailedLogs(
            activityId ? parseInt(activityId.toString()) : undefined,
        );
    }

    @Post('activities/:activityId/retry-failed')
    @Roles(Role.DEV, Role.ADMIN, Role.CHIEF_MONITOR)
    @ApiOperation({ summary: 'Retry failed deliveries for an activity' })
    @ApiResponse({ status: 200, description: 'Failed deliveries retried successfully' })
    async retryFailed(@Param('activityId', ParseIntPipe) activityId: number) {
        const invitationList = await this.invitationListService.generateInvitationList(
            activityId,
        );
        return this.notificationService.retryFailed(activityId, invitationList);
    }

    @Get('statistics')
    @Roles(Role.DEV, Role.ADMIN, Role.CHIEF_MONITOR)
    @ApiOperation({ summary: 'Get delivery statistics' })
    @ApiQuery({ name: 'activityId', required: false, type: Number })
    @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
    async getStatistics(@Query('activityId') activityId?: number) {
        return this.notificationService.getDeliveryStatistics(
            activityId ? parseInt(activityId.toString()) : undefined,
        );
    }
}
