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
    ParseBoolPipe,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiQuery,
} from '@nestjs/swagger';
import { AttendanceService } from './attendance.service';
import {
    CreateAttendanceDto,
    UpdateAttendanceDto,
    BulkAttendanceDto,
} from '../../dto/request/attendance.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';

@ApiTags('Attendance')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('attendance')
export class AttendanceController {
    constructor(private readonly attendanceService: AttendanceService) { }

    @Post()
    @Roles(Role.DEV, Role.ADMIN, Role.CHIEF_MONITOR, Role.MONITOR)
    @ApiOperation({ summary: 'Record attendance for a child' })
    @ApiResponse({
        status: 201,
        description: 'Attendance recorded successfully',
    })
    @ApiResponse({ status: 404, description: 'Child, Activity, or Monitor not found' })
    @ApiResponse({ status: 409, description: 'Attendance already recorded' })
    create(@Body() createAttendanceDto: CreateAttendanceDto) {
        return this.attendanceService.create(createAttendanceDto);
    }

    @Post('bulk')
    @Roles(Role.DEV, Role.ADMIN, Role.CHIEF_MONITOR, Role.MONITOR)
    @ApiOperation({ summary: 'Record bulk attendance for multiple children' })
    @ApiResponse({
        status: 201,
        description: 'Bulk attendance recorded successfully',
    })
    @ApiResponse({ status: 400, description: 'Invalid data' })
    @ApiResponse({ status: 409, description: 'Some attendance already recorded' })
    createBulk(@Body() bulkAttendanceDto: BulkAttendanceDto) {
        return this.attendanceService.createBulk(bulkAttendanceDto);
    }

    @Get()
    @Roles(Role.DEV, Role.ADMIN, Role.CHIEF_MONITOR, Role.MONITOR)
    @ApiOperation({ summary: 'Get all attendance records' })
    @ApiQuery({ name: 'childId', required: false, type: Number })
    @ApiQuery({ name: 'activityId', required: false, type: Number })
    @ApiQuery({ name: 'monitorId', required: false, type: Number })
    @ApiQuery({ name: 'present', required: false, type: Boolean })
    @ApiResponse({ status: 200, description: 'List of attendance records' })
    findAll(
        @Query('childId') childId?: number,
        @Query('activityId') activityId?: number,
        @Query('monitorId') monitorId?: number,
        @Query('present') present?: boolean,
    ) {
        const filters: any = {};
        if (childId) filters.childId = +childId;
        if (activityId) filters.activityId = +activityId;
        if (monitorId) filters.monitorId = +monitorId;
        if (present !== undefined) filters.present = present === true;

        return this.attendanceService.findAll(filters);
    }

    @Get('statistics')
    @Roles(Role.DEV, Role.ADMIN, Role.CHIEF_MONITOR)
    @ApiOperation({ summary: 'Get attendance statistics' })
    @ApiQuery({ name: 'activityId', required: false, type: Number })
    @ApiQuery({ name: 'childId', required: false, type: Number })
    @ApiQuery({ name: 'startDate', required: false, type: String })
    @ApiQuery({ name: 'endDate', required: false, type: String })
    @ApiResponse({ status: 200, description: 'Attendance statistics' })
    getStatistics(
        @Query('activityId') activityId?: number,
        @Query('childId') childId?: number,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
    ) {
        const filters: any = {};
        if (activityId) filters.activityId = +activityId;
        if (childId) filters.childId = +childId;
        if (startDate) filters.startDate = startDate;
        if (endDate) filters.endDate = endDate;

        return this.attendanceService.getAttendanceStatistics(filters);
    }

    @Get('by-activity/:activityId')
    @Roles(Role.DEV, Role.ADMIN, Role.CHIEF_MONITOR, Role.MONITOR)
    @ApiOperation({ summary: 'Get attendance records by activity' })
    @ApiResponse({ status: 200, description: 'List of attendance records' })
    @ApiResponse({ status: 404, description: 'Activity not found' })
    getAttendanceByActivity(@Param('activityId', ParseIntPipe) activityId: number) {
        return this.attendanceService.getAttendanceByActivity(activityId);
    }

    @Get('by-child/:childId')
    @Roles(Role.DEV, Role.ADMIN, Role.CHIEF_MONITOR, Role.MONITOR)
    @ApiOperation({ summary: 'Get attendance records by child' })
    @ApiResponse({ status: 200, description: 'List of attendance records' })
    @ApiResponse({ status: 404, description: 'Child not found' })
    getAttendanceByChild(@Param('childId', ParseIntPipe) childId: number) {
        return this.attendanceService.getAttendanceByChild(childId);
    }

    @Get('child-rate/:childId')
    @Roles(Role.DEV, Role.ADMIN, Role.CHIEF_MONITOR, Role.MONITOR)
    @ApiOperation({ summary: 'Get attendance rate for a child' })
    @ApiResponse({ status: 200, description: 'Child attendance rate' })
    @ApiResponse({ status: 404, description: 'Child not found' })
    getChildAttendanceRate(@Param('childId', ParseIntPipe) childId: number) {
        return this.attendanceService.getChildAttendanceRate(childId);
    }

    @Get('activity-report/:activityId')
    @Roles(Role.DEV, Role.ADMIN, Role.CHIEF_MONITOR, Role.MONITOR)
    @ApiOperation({ summary: 'Get attendance report for an activity' })
    @ApiResponse({ status: 200, description: 'Activity attendance report' })
    @ApiResponse({ status: 404, description: 'Activity not found' })
    getActivityAttendanceReport(
        @Param('activityId', ParseIntPipe) activityId: number,
    ) {
        return this.attendanceService.getActivityAttendanceReport(activityId);
    }

    @Get(':id')
    @Roles(Role.DEV, Role.ADMIN, Role.CHIEF_MONITOR, Role.MONITOR)
    @ApiOperation({ summary: 'Get an attendance record by ID' })
    @ApiResponse({ status: 200, description: 'Attendance record details' })
    @ApiResponse({ status: 404, description: 'Attendance record not found' })
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.attendanceService.findOne(id);
    }

    @Patch(':id')
    @Roles(Role.DEV, Role.ADMIN, Role.CHIEF_MONITOR, Role.MONITOR)
    @ApiOperation({ summary: 'Update an attendance record' })
    @ApiResponse({
        status: 200,
        description: 'Attendance record updated successfully',
    })
    @ApiResponse({ status: 404, description: 'Attendance record not found' })
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateAttendanceDto: UpdateAttendanceDto,
    ) {
        return this.attendanceService.update(id, updateAttendanceDto);
    }

    @Delete(':id')
    @Roles(Role.DEV, Role.ADMIN, Role.CHIEF_MONITOR)
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Delete an attendance record' })
    @ApiResponse({
        status: 204,
        description: 'Attendance record deleted successfully',
    })
    @ApiResponse({ status: 404, description: 'Attendance record not found' })
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.attendanceService.remove(id);
    }
}
