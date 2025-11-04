import { Controller, Get, Post, Patch, Param, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AttendanceService } from './attendance.service';
import { MarkAttendanceRequest, UpdateAttendanceRequest } from '../../request/attendance.request';
import { SuccessResponse } from '../../response/common.response';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Attendance } from '../../entities/attendance.entity';

@ApiTags('Attendance')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('activities/:activityId/attendance')
export class AttendanceController {
	constructor(private readonly attendanceService: AttendanceService) {}

	@Post()
	@ApiOperation({ summary: 'Mark attendance for an activity' })
	async markAttendance(
		@Param('activityId') activityId: string,
		@Request() req,
		@Body() markRequest: MarkAttendanceRequest
	): Promise<SuccessResponse> {
		await this.attendanceService.markAttendance(activityId, req.user.id, markRequest);
		return new SuccessResponse('Attendance marked successfully');
	}

	@Get()
	@ApiOperation({ summary: 'Get attendance records for an activity' })
	async getAttendance(
		@Param('activityId') activityId: string
	): Promise<SuccessResponse<Attendance[]>> {
		const attendance = await this.attendanceService.getAttendance(activityId);
		return new SuccessResponse('Attendance retrieved successfully', attendance);
	}

	@Patch(':attendanceId')
	@ApiOperation({ summary: 'Update an attendance record' })
	async updateAttendance(
		@Param('attendanceId') attendanceId: string,
		@Request() req,
		@Body() updateRequest: UpdateAttendanceRequest
	): Promise<SuccessResponse<Attendance>> {
		const attendance = await this.attendanceService.updateAttendance(
			attendanceId,
			req.user.id,
			updateRequest
		);
		return new SuccessResponse('Attendance updated successfully', attendance);
	}
}
