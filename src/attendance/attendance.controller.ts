import { Body, Controller, Get, Param, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '../common/enums/user.enum';
import { UpsertAttendanceDto } from '../dtos/request/attendance.dto';
import { AttendanceResponseDto } from '../dtos/response/attendance.dto';
import { AttendanceService } from './attendance.service';

@ApiBearerAuth()
@ApiTags('attendance')
@Controller('activities/:activityId/attendance')
export class AttendanceController {
    constructor(private readonly attendanceService: AttendanceService) {}

    @Roles([UserRole.Monitor])
    @Get()
    @ApiOkResponse({ type: AttendanceResponseDto })
    get(@Param('activityId') activityId: string) {
        return this.attendanceService.getByActivityId(activityId);
    }

    @Roles([UserRole.Monitor])
    @Put()
    @ApiOkResponse({ type: AttendanceResponseDto })
    upsert(
        @Param('activityId') activityId: string,
        @Body() dto: UpsertAttendanceDto,
        @CurrentUser() currentUser: any,
    ) {
        return this.attendanceService.upsertForActivity(activityId, dto, currentUser);
    }
}
