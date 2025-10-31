import {
    Controller,
    Get,
    Put,
    Post,
    Delete,
    Param,
    Body,
    UseGuards,
    ParseIntPipe,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
} from '@nestjs/swagger';
import { RecipientService } from './recipient.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { BulkRecipientsDto, SetRecipientsDto } from 'src/dto/request/invitation-recepient.dto';

@ApiTags('Invitation Recipients')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('invitation-recipients')
export class RecipientController {
    constructor(private readonly recipientService: RecipientService) { }

    @Get('activities/:activityId')
    @Roles(Role.DEV, Role.ADMIN, Role.CHIEF_MONITOR)
    @ApiOperation({ summary: 'Get configured recipients for an activity' })
    @ApiResponse({ status: 200, description: 'Recipients retrieved successfully' })
    async getRecipients(@Param('activityId', ParseIntPipe) activityId: number) {
        return this.recipientService.getRecipientsWithPreferences(activityId);
    }

    @Put('activities/:activityId')
    @Roles(Role.DEV, Role.ADMIN, Role.CHIEF_MONITOR)
    @ApiOperation({ summary: 'Set recipients for an activity (replaces existing)' })
    @ApiResponse({ status: 200, description: 'Recipients set successfully' })
    @ApiResponse({ status: 404, description: 'Activity or monitors not found' })
    async setRecipients(
        @Param('activityId', ParseIntPipe) activityId: number,
        @Body() setRecipientsDto: SetRecipientsDto,
    ) {
        return this.recipientService.setInvitationRecipients(activityId, setRecipientsDto);
    }

    @Post('bulk')
    @Roles(Role.DEV, Role.ADMIN, Role.CHIEF_MONITOR)
    @ApiOperation({ summary: 'Set recipients for multiple activities at once' })
    @ApiResponse({ status: 200, description: 'Bulk recipients set successfully' })
    async setBulkRecipients(@Body() bulkRecipientsDto: BulkRecipientsDto) {
        return this.recipientService.setBulkRecipients(bulkRecipientsDto);
    }

    @Delete('activities/:activityId/monitors/:monitorId')
    @Roles(Role.DEV, Role.ADMIN, Role.CHIEF_MONITOR)
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Remove a specific recipient from an activity' })
    @ApiResponse({ status: 204, description: 'Recipient removed successfully' })
    @ApiResponse({ status: 404, description: 'Recipient not found' })
    async removeRecipient(
        @Param('activityId', ParseIntPipe) activityId: number,
        @Param('monitorId', ParseIntPipe) monitorId: number,
    ) {
        await this.recipientService.removeRecipient(activityId, monitorId);
    }

    @Get('default')
    @Roles(Role.DEV, Role.ADMIN, Role.CHIEF_MONITOR)
    @ApiOperation({ summary: 'Get default recipients (Chief Monitors and Admins)' })
    @ApiResponse({ status: 200, description: 'Default recipients retrieved successfully' })
    async getDefaultRecipients() {
        return this.recipientService.getDefaultRecipients();
    }
}
