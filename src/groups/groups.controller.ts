import { Controller, Get, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator';
import { MonitorLevel, UserRole } from '../common/enums/user.enum';
import { AgeToGroupMappingResponseDto, GroupRecomputeResultDto } from '../dtos/response/groups.dto';
import { GroupsService } from './groups.service';

@ApiTags('groups')
@ApiBearerAuth()
@Controller('groups')
export class GroupsController {
    constructor(private readonly groupsService: GroupsService) {}

    @Roles([UserRole.Monitor], [MonitorLevel.Super])
    @Get('mapping')
    @ApiOkResponse({ type: AgeToGroupMappingResponseDto })
    async getMapping() {
        return this.groupsService.getAgeToGroupMapping();
    }

    @Roles([UserRole.Monitor], [MonitorLevel.Super])
    @Post('recompute')
    @ApiOkResponse({ type: GroupRecomputeResultDto })
    async recompute() {
        return this.groupsService.recomputeAllChildren();
    }
}
