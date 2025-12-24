import { Body, Controller, Get, Param, Put, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Town } from '../common/enums/activity.enum';
import { UserRole } from '../common/enums/user.enum';
import { UpsertAttendanceDto } from '../dtos/request/attendance.dto';
import { AttendanceResponseDto } from '../dtos/response/attendance.dto';
import {
    AttendanceEligibleChildrenResponseDto,
    AttendanceRosterResponseDto,
} from '../dtos/response/attendance-roster.dto';
import { AttendanceService } from './attendance.service';

@ApiBearerAuth()
@ApiTags('attendance')
@Controller('activities/:activityId/attendance')
export class AttendanceController {
    constructor(private readonly attendanceService: AttendanceService) {}

    @Roles([UserRole.Monitor])
    @Get()
    @ApiOkResponse({ type: AttendanceResponseDto })
    get(
        @Param('activityId') activityId: string,
        @Query('scopeTown') scopeTown: Town | undefined,
        @CurrentUser() currentUser: any,
    ) {
        return this.attendanceService.getByActivityId(activityId, currentUser, scopeTown);
    }

    @Roles([UserRole.Monitor])
    @Get('roster')
    @ApiOkResponse({ type: AttendanceRosterResponseDto })
    roster(
        @Param('activityId') activityId: string,
        @Query('scopeTown') scopeTown: Town | undefined,
        @CurrentUser() currentUser: any,
    ) {
        return this.attendanceService.getRoster(activityId, currentUser, scopeTown);
    }

    @Roles([UserRole.Monitor])
    @Get('eligible-children')
    @ApiOkResponse({ type: AttendanceEligibleChildrenResponseDto })
    eligibleChildren(
        @Param('activityId') activityId: string,
        @Query('query') query = '',
        @Query('limit') limit = '15',
        @Query('scopeTown') scopeTown: Town | undefined,
        @CurrentUser() currentUser: any,
    ) {
        return this.attendanceService.searchEligibleChildren(
            activityId,
            query,
            Number(limit),
            currentUser,
            scopeTown,
        );
    }

    @Roles([UserRole.Monitor])
    @Put()
    @ApiOkResponse({ type: AttendanceResponseDto })
    upsert(
        @Param('activityId') activityId: string,
        @Body() dto: UpsertAttendanceDto,
        @Query('scopeTown') scopeTown: Town | undefined,
        @CurrentUser() currentUser: any,
    ) {
        return this.attendanceService.upsertForActivity(activityId, dto, currentUser, scopeTown);
    }
}
