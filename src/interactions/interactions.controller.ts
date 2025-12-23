import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { NotificationContextType } from '../common/enums/notification.enum';
import { UserRole } from '../common/enums/user.enum';
import { InteractionListQueryDto } from '../dtos/request/interaction.dto';
import { InteractionEventsListResponseDto } from '../dtos/response/interaction.dto';
import { InteractionsService } from './interactions.service';

@ApiBearerAuth()
@ApiTags('interactions')
@Controller('interactions')
export class InteractionsController {
    constructor(private readonly interactionsService: InteractionsService) {}

    @Roles([UserRole.Monitor])
    @Get('me')
    @ApiOkResponse({ type: InteractionEventsListResponseDto })
    listMine(@CurrentUser() currentUser: any, @Query() query: InteractionListQueryDto) {
        return this.interactionsService.listMine(currentUser, query.limit ?? 50, query.cursor);
    }

    @Roles([UserRole.Monitor])
    @Get(':contextType/:contextId')
    @ApiOkResponse({ type: InteractionEventsListResponseDto })
    listByContext(
        @Param('contextType') contextType: NotificationContextType,
        @Param('contextId') contextId: string,
        @CurrentUser() currentUser: any,
        @Query() query: InteractionListQueryDto,
    ) {
        return this.interactionsService.listByContext(
            contextType,
            contextId,
            currentUser,
            query.limit ?? 50,
            query.cursor,
        );
    }
}
