import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { MonitorLevel, UserRole } from '../common/enums/user.enum';
import {
    CreateReminderDto,
    RespondReminderDto,
    UpdateReminderDto,
} from '../dtos/request/reminder.dto';
import { ReminderResponseDto, RemindersListResponseDto } from '../dtos/response/reminder.dto';
import { RemindersService } from './reminders.service';

@ApiBearerAuth()
@ApiTags('reminders')
@Controller('reminders')
export class RemindersController {
    constructor(private readonly remindersService: RemindersService) {}

    @Roles([UserRole.Monitor], [MonitorLevel.Official, MonitorLevel.Super])
    @Post()
    @ApiCreatedResponse({ type: ReminderResponseDto })
    create(@Body() dto: CreateReminderDto, @CurrentUser() currentUser: any) {
        return this.remindersService.create(dto, currentUser);
    }

    @Roles([UserRole.Monitor])
    @Get()
    @ApiOkResponse({ type: RemindersListResponseDto })
    async list(@CurrentUser() currentUser: any) {
        const items = await this.remindersService.list(currentUser);
        return { items };
    }

    @Roles([UserRole.Monitor])
    @Get(':id')
    @ApiOkResponse({ type: ReminderResponseDto })
    findOne(@Param('id') id: string, @CurrentUser() currentUser: any) {
        return this.remindersService.findOneOrFail(id, currentUser);
    }

    @Roles([UserRole.Monitor], [MonitorLevel.Official, MonitorLevel.Super])
    @Patch(':id')
    @ApiOkResponse({ type: ReminderResponseDto })
    update(
        @Param('id') id: string,
        @Body() dto: UpdateReminderDto,
        @CurrentUser() currentUser: any,
    ) {
        return this.remindersService.update(id, dto, currentUser);
    }

    @Roles([UserRole.Monitor], [MonitorLevel.Official, MonitorLevel.Super])
    @Post(':id/activate')
    @ApiOkResponse({ type: ReminderResponseDto })
    activate(@Param('id') id: string, @CurrentUser() currentUser: any) {
        return this.remindersService.activate(id, currentUser);
    }

    @Roles([UserRole.Monitor], [MonitorLevel.Official, MonitorLevel.Super])
    @Post(':id/pause')
    @ApiOkResponse({ type: ReminderResponseDto })
    pause(@Param('id') id: string, @CurrentUser() currentUser: any) {
        return this.remindersService.pause(id, currentUser);
    }

    @Roles([UserRole.Monitor], [MonitorLevel.Official, MonitorLevel.Super])
    @Post(':id/end')
    @ApiOkResponse({ type: ReminderResponseDto })
    end(@Param('id') id: string, @CurrentUser() currentUser: any) {
        return this.remindersService.end(id, currentUser);
    }

    @Roles([UserRole.Monitor])
    @Post(':id/ack')
    @ApiOkResponse({ type: ReminderResponseDto })
    acknowledge(@Param('id') id: string, @CurrentUser() currentUser: any) {
        return this.remindersService.acknowledge(id, currentUser);
    }

    @Roles([UserRole.Monitor])
    @Post(':id/respond')
    @ApiOkResponse({ type: ReminderResponseDto })
    respond(
        @Param('id') id: string,
        @Body() dto: RespondReminderDto,
        @CurrentUser() currentUser: any,
    ) {
        return this.remindersService.respond(id, dto, currentUser);
    }
}
