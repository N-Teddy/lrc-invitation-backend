import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Town } from '../common/enums/activity.enum';
import { MonitorLevel, UserRole } from '../common/enums/user.enum';
import {
    ActivityAttendanceStatsDto,
    Turning19ReportDto,
    YearlyAttendanceSummaryDto,
} from '../dtos/response/reporting.dto';
import { ReportingService } from './reporting.service';

@ApiBearerAuth()
@ApiTags('reports')
@Controller('reports')
export class ReportingController {
    constructor(private readonly reportingService: ReportingService) {}

    @Roles([UserRole.Monitor])
    @Get('activities/:activityId/attendance-stats')
    @ApiOkResponse({ type: ActivityAttendanceStatsDto })
    async activityAttendanceStats(
        @Param('activityId') activityId: string,
        @CurrentUser() currentUser: any,
    ) {
        const isSuper = currentUser?.monitorLevel === MonitorLevel.Super;
        const originTown = !isSuper ? (currentUser?.originTown as Town | undefined) : undefined;
        return this.reportingService.getActivityAttendanceStats(activityId, { originTown });
    }

    @Roles([UserRole.Monitor])
    @Get('yearly/:year/attendance-summary')
    @ApiOkResponse({ type: YearlyAttendanceSummaryDto })
    async yearlyAttendanceSummary(
        @Param('year') yearStr: string,
        @CurrentUser() currentUser: any,
        @Query('town') town?: Town,
    ) {
        const year = Number(yearStr);
        const isSuper = currentUser?.monitorLevel === MonitorLevel.Super;

        // For non-super: scope to their own originTown for origin-based reporting.
        const originTown = !isSuper ? (currentUser?.originTown as Town | undefined) : undefined;

        // For non-super: also scope activity calendars to their town.
        const activityTown = !isSuper ? (currentUser?.originTown as Town | undefined) : town;

        return this.reportingService.getYearlyAttendanceSummary(year, { activityTown, originTown });
    }

    @Roles([UserRole.Monitor], [MonitorLevel.Super])
    @Get('yearly/:year/turning-19')
    @ApiOkResponse({ type: Turning19ReportDto })
    async turning19Report(@Param('year') yearStr: string, @Query('town') town?: Town) {
        const year = Number(yearStr);
        return this.reportingService.getTurning19Report(year, { originTown: town });
    }
}
