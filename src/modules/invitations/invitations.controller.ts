import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
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
    ApiQuery,
} from '@nestjs/swagger';
import { InvitationsService } from './invitations.service';
import {
    CreateInvitationDto,
    UpdateInvitationDto,
    BulkInvitationDto,
    RespondToInvitationDto,
} from '../../dto/request/invitations.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { InvitationStatus } from '../../common/enums/invitation-status.enum';

@ApiTags('Invitations')
@Controller('invitations')
export class InvitationsController {
    constructor(private readonly invitationsService: InvitationsService) { }

    @Post()
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.DEV, Role.ADMIN, Role.CHIEF_MONITOR, Role.MONITOR)
    @ApiOperation({ summary: 'Create a new invitation' })
    @ApiResponse({ status: 201, description: 'Invitation created successfully' })
    @ApiResponse({ status: 404, description: 'Child or Activity not found' })
    @ApiResponse({ status: 409, description: 'Invitation already exists' })
    create(@Body() createInvitationDto: CreateInvitationDto) {
        return this.invitationsService.create(createInvitationDto);
    }

    @Post('bulk')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.DEV, Role.ADMIN, Role.CHIEF_MONITOR, Role.MONITOR)
    @ApiOperation({ summary: 'Create bulk invitations' })
    @ApiResponse({
        status: 201,
        description: 'Bulk invitations created successfully',
    })
    @ApiResponse({ status: 400, description: 'Invalid data' })
    @ApiResponse({ status: 409, description: 'Some invitations already exist' })
    createBulk(@Body() bulkInvitationDto: BulkInvitationDto) {
        return this.invitationsService.createBulk(bulkInvitationDto);
    }

    @Post('respond/:code')
    @ApiOperation({ summary: 'Respond to an invitation (public endpoint)' })
    @ApiResponse({ status: 200, description: 'Response recorded successfully' })
    @ApiResponse({ status: 404, description: 'Invitation not found' })
    @ApiResponse({ status: 400, description: 'Invalid invitation status' })
    respondToInvitation(
        @Param('code') code: string,
        @Body() respondDto: RespondToInvitationDto,
    ) {
        return this.invitationsService.respondToInvitation(code, respondDto);
    }

    @Get()
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.DEV, Role.ADMIN, Role.CHIEF_MONITOR, Role.MONITOR)
    @ApiOperation({ summary: 'Get all invitations' })
    @ApiQuery({ name: 'childId', required: false, type: Number })
    @ApiQuery({ name: 'activityId', required: false, type: Number })
    @ApiQuery({ name: 'status', required: false, enum: InvitationStatus })
    @ApiResponse({ status: 200, description: 'List of invitations' })
    findAll(
        @Query('childId') childId?: number,
        @Query('activityId') activityId?: number,
        @Query('status') status?: InvitationStatus,
    ) {
        const filters: any = {};
        if (childId) filters.childId = +childId;
        if (activityId) filters.activityId = +activityId;
        if (status) filters.status = status;

        return this.invitationsService.findAll(filters);
    }

    @Get('statistics')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.DEV, Role.ADMIN, Role.CHIEF_MONITOR)
    @ApiOperation({ summary: 'Get invitation statistics' })
    @ApiQuery({ name: 'activityId', required: false, type: Number })
    @ApiResponse({ status: 200, description: 'Invitation statistics' })
    getStatistics(@Query('activityId') activityId?: number) {
        return this.invitationsService.getInvitationStatistics(
            activityId ? +activityId : undefined,
        );
    }

    @Get('by-activity/:activityId')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.DEV, Role.ADMIN, Role.CHIEF_MONITOR, Role.MONITOR)
    @ApiOperation({ summary: 'Get invitations by activity' })
    @ApiResponse({ status: 200, description: 'List of invitations' })
    @ApiResponse({ status: 404, description: 'Activity not found' })
    getInvitationsByActivity(@Param('activityId', ParseIntPipe) activityId: number) {
        return this.invitationsService.getInvitationsByActivity(activityId);
    }

    @Get('by-child/:childId')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.DEV, Role.ADMIN, Role.CHIEF_MONITOR, Role.MONITOR)
    @ApiOperation({ summary: 'Get invitations by child' })
    @ApiResponse({ status: 200, description: 'List of invitations' })
    @ApiResponse({ status: 404, description: 'Child not found' })
    getInvitationsByChild(@Param('childId', ParseIntPipe) childId: number) {
        return this.invitationsService.getInvitationsByChild(childId);
    }

    @Get('code/:code')
    @ApiOperation({ summary: 'Get invitation by code (public endpoint)' })
    @ApiResponse({ status: 200, description: 'Invitation details' })
    @ApiResponse({ status: 404, description: 'Invitation not found' })
    findByCode(@Param('code') code: string) {
        return this.invitationsService.findByCode(code);
    }

    @Get(':id')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.DEV, Role.ADMIN, Role.CHIEF_MONITOR, Role.MONITOR)
    @ApiOperation({ summary: 'Get an invitation by ID' })
    @ApiResponse({ status: 200, description: 'Invitation details' })
    @ApiResponse({ status: 404, description: 'Invitation not found' })
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.invitationsService.findOne(id);
    }

    @Patch(':id')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.DEV, Role.ADMIN, Role.CHIEF_MONITOR, Role.MONITOR)
    @ApiOperation({ summary: 'Update an invitation' })
    @ApiResponse({ status: 200, description: 'Invitation updated successfully' })
    @ApiResponse({ status: 404, description: 'Invitation not found' })
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateInvitationDto: UpdateInvitationDto,
    ) {
        return this.invitationsService.update(id, updateInvitationDto);
    }

    @Patch(':id/mark-sent')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.DEV, Role.ADMIN, Role.CHIEF_MONITOR, Role.MONITOR)
    @ApiOperation({ summary: 'Mark invitation as sent' })
    @ApiResponse({ status: 200, description: 'Invitation marked as sent' })
    @ApiResponse({ status: 404, description: 'Invitation not found' })
    @ApiResponse({ status: 400, description: 'Invalid status' })
    markAsSent(@Param('id', ParseIntPipe) id: number) {
        return this.invitationsService.markAsSent(id);
    }

    @Patch('activity/:activityId/mark-sent')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.DEV, Role.ADMIN, Role.CHIEF_MONITOR, Role.MONITOR)
    @ApiOperation({ summary: 'Mark all pending invitations as sent for activity' })
    @ApiResponse({
        status: 200,
        description: 'All invitations marked as sent',
    })
    @ApiResponse({ status: 404, description: 'No pending invitations found' })
    markBulkAsSent(@Param('activityId', ParseIntPipe) activityId: number) {
        return this.invitationsService.markBulkAsSent(activityId);
    }

    @Delete(':id')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.DEV, Role.ADMIN, Role.CHIEF_MONITOR)
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Delete an invitation' })
    @ApiResponse({ status: 204, description: 'Invitation deleted successfully' })
    @ApiResponse({ status: 404, description: 'Invitation not found' })
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.invitationsService.remove(id);
    }
}
