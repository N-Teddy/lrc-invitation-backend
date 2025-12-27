import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ActivityType, Town } from '../common/enums/activity.enum';
import { MonitorLevel, UserRole } from '../common/enums/user.enum';
import {
    CreateActivityDto,
    BulkCreateActivitiesDto,
    UpdateActivityDto,
    UpdateActivityInvitationsDto,
} from '../dtos/request/activity.dto';
import {
    ActivityResponseDto,
    BulkCreateActivitiesResponseDto,
} from '../dtos/response/activity.dto';
import {
    ActivityEligibleChildrenResponseDto,
    ActivityInvitedChildrenResponseDto,
} from '../dtos/response/activity-invitations.dto';
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

    @Roles([UserRole.Monitor], [MonitorLevel.Official, MonitorLevel.Super])
    @Post('bulk')
    @ApiCreatedResponse({ type: BulkCreateActivitiesResponseDto })
    bulkCreate(@Body() dto: BulkCreateActivitiesDto, @CurrentUser() currentUser: any) {
        return this.activitiesService.bulkCreate(dto, currentUser);
    }

    @Roles([UserRole.Monitor])
    @Get()
    @ApiOkResponse({ type: [ActivityResponseDto] })
    findAll(
        @Query('town') town?: Town,
        @Query('type') type?: ActivityType,
        @Query('year') year?: string,
        @Query('from') from?: string,
        @Query('to') to?: string,
        @CurrentUser() currentUser?: any,
    ) {
        return this.activitiesService.findAll(
            { town, type, year: year ? Number(year) : undefined, from, to },
            currentUser,
        );
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

    @Roles([UserRole.Monitor], [MonitorLevel.Official, MonitorLevel.Super])
    @Patch(':id/invitations')
    @ApiOkResponse({ type: ActivityResponseDto })
    overrideInvitations(
        @Param('id') id: string,
        @Body() dto: UpdateActivityInvitationsDto,
        @CurrentUser() currentUser: any,
    ) {
        return this.activitiesService.overrideInvitations(id, dto, currentUser);
    }

    @Roles([UserRole.Monitor])
    @Get(':id/invitations/children')
    @ApiOkResponse({ type: ActivityInvitedChildrenResponseDto })
    invitedChildren(@Param('id') id: string, @CurrentUser() currentUser: any) {
        return this.activitiesService.getInvitedChildrenDetails(id, currentUser);
    }

    @Roles([UserRole.Monitor], [MonitorLevel.Official, MonitorLevel.Super])
    @Get(':id/invitations/eligible-children')
    @ApiOkResponse({ type: ActivityEligibleChildrenResponseDto })
    eligibleChildren(
        @Param('id') id: string,
        @Query('query') query = '',
        @Query('limit') limit = '15',
        @CurrentUser() currentUser: any,
    ) {
        return this.activitiesService.searchEligibleChildrenForInvitations(
            id,
            query,
            Number(limit),
            currentUser,
        );
    }
}
