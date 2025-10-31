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
import { ActivitiesService } from './activities.service';
import {
    CreateActivityDto,
    UpdateActivityDto,
} from '../../dto/request/activities.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { ActivityType } from '../../common/enums/activity-type.enum';
import { Region } from '../../common/enums/region.enum';
import { AgeGroup } from '../../common/enums/age-group.enum';

@ApiTags('Activities')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('activities')
export class ActivitiesController {
    constructor(private readonly activitiesService: ActivitiesService) { }

    @Post()
    @Roles(Role.DEV, Role.ADMIN, Role.CHIEF_MONITOR, Role.MONITOR)
    @ApiOperation({ summary: 'Create a new activity' })
    @ApiResponse({ status: 201, description: 'Activity created successfully' })
    @ApiResponse({ status: 400, description: 'Invalid data' })
    @ApiResponse({ status: 404, description: 'Monitor not found' })
    create(@Body() createActivityDto: CreateActivityDto) {
        return this.activitiesService.create(createActivityDto);
    }

    @Get()
    @Roles(Role.DEV, Role.ADMIN, Role.CHIEF_MONITOR, Role.MONITOR)
    @ApiOperation({ summary: 'Get all activities' })
    @ApiQuery({ name: 'type', required: false, enum: ActivityType })
    @ApiQuery({ name: 'region', required: false, enum: Region })
    @ApiQuery({ name: 'targetAgeGroup', required: false, enum: AgeGroup })
    @ApiQuery({ name: 'monitorId', required: false, type: Number })
    @ApiQuery({ name: 'startDate', required: false, type: String })
    @ApiQuery({ name: 'endDate', required: false, type: String })
    @ApiResponse({ status: 200, description: 'List of activities' })
    findAll(
        @Query('type') type?: ActivityType,
        @Query('region') region?: Region,
        @Query('targetAgeGroup') targetAgeGroup?: AgeGroup,
        @Query('monitorId') monitorId?: number,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
    ) {
        const filters: any = {};
        if (type) filters.type = type;
        if (region) filters.region = region;
        if (targetAgeGroup) filters.targetAgeGroup = targetAgeGroup;
        if (monitorId) filters.monitorId = monitorId;
        if (startDate) filters.startDate = startDate;
        if (endDate) filters.endDate = endDate;

        return this.activitiesService.findAll(filters);
    }

    @Get('statistics')
    @Roles(Role.DEV, Role.ADMIN, Role.CHIEF_MONITOR)
    @ApiOperation({ summary: 'Get activities statistics' })
    @ApiQuery({ name: 'startDate', required: false, type: String })
    @ApiQuery({ name: 'endDate', required: false, type: String })
    @ApiQuery({ name: 'region', required: false, enum: Region })
    @ApiResponse({ status: 200, description: 'Activities statistics' })
    getStatistics(
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
        @Query('region') region?: Region,
    ) {
        const filters: any = {};
        if (startDate) filters.startDate = startDate;
        if (endDate) filters.endDate = endDate;
        if (region) filters.region = region;

        return this.activitiesService.getStatistics(filters);
    }

    @Get('upcoming')
    @Roles(Role.DEV, Role.ADMIN, Role.CHIEF_MONITOR, Role.MONITOR)
    @ApiOperation({ summary: 'Get upcoming activities' })
    @ApiQuery({ name: 'region', required: false, enum: Region })
    @ApiQuery({ name: 'ageGroup', required: false, enum: AgeGroup })
    @ApiResponse({ status: 200, description: 'List of upcoming activities' })
    findUpcoming(
        @Query('region') region?: Region,
        @Query('ageGroup') ageGroup?: AgeGroup,
    ) {
        return this.activitiesService.findUpcoming(region, ageGroup);
    }

    @Get('date-range')
    @Roles(Role.DEV, Role.ADMIN, Role.CHIEF_MONITOR, Role.MONITOR)
    @ApiOperation({ summary: 'Get activities by date range' })
    @ApiQuery({ name: 'startDate', required: true, type: String })
    @ApiQuery({ name: 'endDate', required: true, type: String })
    @ApiResponse({ status: 200, description: 'List of activities' })
    findByDateRange(
        @Query('startDate') startDate: string,
        @Query('endDate') endDate: string,
    ) {
        return this.activitiesService.findByDateRange(startDate, endDate);
    }

    @Get(':id')
    @Roles(Role.DEV, Role.ADMIN, Role.CHIEF_MONITOR, Role.MONITOR)
    @ApiOperation({ summary: 'Get an activity by ID' })
    @ApiResponse({ status: 200, description: 'Activity details' })
    @ApiResponse({ status: 404, description: 'Activity not found' })
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.activitiesService.findOne(id);
    }

    @Patch(':id')
    @Roles(Role.DEV, Role.ADMIN, Role.CHIEF_MONITOR, Role.MONITOR)
    @ApiOperation({ summary: 'Update an activity' })
    @ApiResponse({ status: 200, description: 'Activity updated successfully' })
    @ApiResponse({ status: 404, description: 'Activity not found' })
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateActivityDto: UpdateActivityDto,
    ) {
        return this.activitiesService.update(id, updateActivityDto);
    }

    @Delete(':id')
    @Roles(Role.DEV, Role.ADMIN, Role.CHIEF_MONITOR)
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Delete an activity' })
    @ApiResponse({ status: 204, description: 'Activity deleted successfully' })
    @ApiResponse({ status: 404, description: 'Activity not found' })
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.activitiesService.remove(id);
    }
}
