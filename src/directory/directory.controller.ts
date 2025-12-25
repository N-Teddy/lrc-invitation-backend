import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user.enum';
import { MonitorDirectoryQueryDto } from '../dtos/request/directory.dto';
import { MonitorDirectoryResponseDto } from '../dtos/response/directory.dto';
import { DirectoryService } from './directory.service';

@ApiBearerAuth()
@ApiTags('directory')
@Controller('directory')
export class DirectoryController {
    constructor(private readonly directoryService: DirectoryService) {}

    @Roles([UserRole.Monitor])
    @Get('monitors')
    @ApiOkResponse({ type: MonitorDirectoryResponseDto, isArray: true })
    monitors(@CurrentUser() currentUser: any, @Query() query: MonitorDirectoryQueryDto) {
        return this.directoryService.listMonitors(currentUser, query);
    }
}
