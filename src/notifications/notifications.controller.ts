import { Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user.enum';
import { NotificationsListQueryDto } from '../dtos/request/notifications.dto';
import {
    NotificationDetailsDto,
    NotificationsListResponseDto,
} from '../dtos/response/notifications.dto';
import { NotificationService } from './notifications.service';

@ApiBearerAuth()
@ApiTags('notifications')
@Controller('notifications')
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationService) {}

    @Roles([UserRole.Monitor])
    @Get()
    @ApiOkResponse({ type: NotificationsListResponseDto })
    list(@Query() query: NotificationsListQueryDto, @CurrentUser() currentUser: any) {
        return this.notificationsService.listForUser(currentUser, query);
    }

    @Roles([UserRole.Monitor])
    @Get(':id')
    @ApiOkResponse({ type: NotificationDetailsDto })
    get(@Param('id') id: string, @CurrentUser() currentUser: any) {
        return this.notificationsService.getForUser(currentUser, id);
    }

    @Roles([UserRole.Monitor])
    @Patch(':id/read')
    @ApiOkResponse({ type: NotificationDetailsDto })
    markRead(@Param('id') id: string, @CurrentUser() currentUser: any) {
        return this.notificationsService.markRead(currentUser, id);
    }

    @Roles([UserRole.Monitor])
    @Post(':id/retry')
    @ApiOkResponse({ type: NotificationDetailsDto })
    retry(@Param('id') id: string, @CurrentUser() currentUser: any) {
        return this.notificationsService.retryNow(currentUser, id);
    }
}
