import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ActivityType, Town } from '../common/enums/activity.enum';
import { MonitorLevel, UserRole } from '../common/enums/user.enum';
import {
    CreateActivityDto,
    UpdateActivityDto,
    UpdateActivityInvitationsDto,
} from '../dtos/request/activity.dto';
import { ActivityResponseDto } from '../dtos/response/activity.dto';
import { ConferenceEligibilityResponseDto } from '../dtos/response/conference-eligibility.dto';
import { ActivitiesService } from './activities.service';

@ApiBearerAuth()
@ApiTags('activities')
@Controller('activities')
export class ActivitiesController {
    constructor(private readonly activitiesService: ActivitiesService) {}

    @Roles([UserRole.Monitor], [MonitorLevel.Official, MonitorLevel.Super])
    @Post()
    @ApiCreatedResponse({ type: ActivityResponseDto })
    create(@Body() dto: CreateActivityDto, @CurrentUser() currentUser: any) {
        return this.activitiesService.create(dto, currentUser);
    }

    @Roles([UserRole.Monitor])
    @Get()
    @ApiOkResponse({ type: [ActivityResponseDto] })
    findAll(
        @Query('town') town?: Town,
        @Query('type') type?: ActivityType,
        @Query('from') from?: string,
        @Query('to') to?: string,
        @CurrentUser() currentUser?: any,
    ) {
        return this.activitiesService.findAll({ town, type, from, to }, currentUser);
    }

    @Roles([UserRole.Monitor])
    @Get(':id')
    @ApiOkResponse({ type: ActivityResponseDto })
    findOne(@Param('id') id: string, @CurrentUser() currentUser: any) {
        return this.activitiesService.findOneOrFail(id, currentUser);
    }

    @Roles([UserRole.Monitor])
    @Get(':id/conference-eligibility')
    @ApiOkResponse({ type: ConferenceEligibilityResponseDto })
    conferenceEligibility(@Param('id') id: string, @CurrentUser() currentUser: any) {
        return this.activitiesService.getConferenceEligibility(id, currentUser);
    }

    @Roles([UserRole.Monitor], [MonitorLevel.Official, MonitorLevel.Super])
    @Patch(':id')
    @ApiOkResponse({ type: ActivityResponseDto })
    update(
        @Param('id') id: string,
        @Body() dto: UpdateActivityDto,
        @CurrentUser() currentUser: any,
    ) {
        return this.activitiesService.update(id, dto, currentUser);
    }

    @Roles([UserRole.Monitor], [MonitorLevel.Official, MonitorLevel.Super])
    @Delete(':id')
    @ApiOkResponse()
    remove(@Param('id') id: string, @CurrentUser() currentUser: any) {
        return this.activitiesService.remove(id, currentUser);
    }

    @Roles([UserRole.Monitor], [MonitorLevel.Official, MonitorLevel.Super])
    @Post(':id/invitations/regenerate')
    @ApiOkResponse({ type: ActivityResponseDto })
    regenerateInvitations(@Param('id') id: string, @CurrentUser() currentUser: any) {
        return this.activitiesService.regenerateInvitations(id, currentUser);
    }

    @Roles([UserRole.Monitor], [MonitorLevel.Super])
    @Patch(':id/invitations')
    @ApiOkResponse({ type: ActivityResponseDto })
    overrideInvitations(
        @Param('id') id: string,
        @Body() dto: UpdateActivityInvitationsDto,
        @CurrentUser() currentUser: any,
    ) {
        return this.activitiesService.overrideInvitations(id, dto, currentUser);
    }
}
