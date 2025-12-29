import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '../common/enums/user.enum';
import { MonitorLevelChangesResponseDto } from '../dtos/response/monitor-level-change.dto';
import { MonitorLevelChangesService } from './monitor-level-changes.service';

@ApiBearerAuth()
@ApiTags('monitor-level-changes')
@Controller('monitor-level-changes')
export class MonitorLevelChangesController {
    constructor(private readonly service: MonitorLevelChangesService) {}

    @Roles([UserRole.Monitor])
    @Get('recent')
    @ApiOkResponse({ type: MonitorLevelChangesResponseDto })
    async recent(
        @CurrentUser() currentUser: any,
        @Query('limit') limit?: string,
        @Query('days') days?: string,
    ) {
        const items = await this.service.listRecent(currentUser, {
            limit: limit ? Number(limit) : undefined,
            days: days ? Number(days) : undefined,
        });
        return { items };
    }
}
