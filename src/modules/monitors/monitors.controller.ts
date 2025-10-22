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
import { MonitorsService } from './monitors.service';
import {
    CreateMonitorDto,
    UpdateMonitorDto,
    UpdateMonitorPasswordDto,
    UpdateYearlyFeeDto,
} from '../../dto/request/monitors.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';

@ApiTags('Monitors')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('monitors')
export class MonitorsController {
    constructor(private readonly monitorsService: MonitorsService) { }

    @Post()
    @Roles(Role.DEV, Role.ADMIN)
    @ApiOperation({ summary: 'Create a new monitor' })
    @ApiResponse({ status: 201, description: 'Monitor created successfully' })
    @ApiResponse({ status: 409, description: 'Email already exists' })
    create(@Body() createMonitorDto: CreateMonitorDto) {
        return this.monitorsService.create(createMonitorDto);
    }

    @Get()
    @Roles(Role.DEV, Role.ADMIN, Role.CHIEF_MONITOR)
    @ApiOperation({ summary: 'Get all monitors' })
    @ApiQuery({ name: 'role', required: false, enum: Role })
    @ApiQuery({ name: 'assignedTown', required: false })
    @ApiQuery({ name: 'yearlyFeePaid', required: false, type: Boolean })
    @ApiResponse({ status: 200, description: 'List of monitors' })
    findAll(
        @Query('role') role?: Role,
        @Query('assignedTown') assignedTown?: string,
        @Query('yearlyFeePaid') yearlyFeePaid?: string,
    ) {
        const filters: any = {};
        if (role) filters.role = role;
        if (assignedTown) filters.assignedTown = assignedTown;
        if (yearlyFeePaid !== undefined) {
            filters.yearlyFeePaid = yearlyFeePaid === 'true';
        }

        return this.monitorsService.findAll(filters);
    }

    @Get('statistics')
    @Roles(Role.DEV, Role.ADMIN)
    @ApiOperation({ summary: 'Get monitor statistics' })
    @ApiResponse({ status: 200, description: 'Monitor statistics' })
    getStatistics() {
        return this.monitorsService.getStatistics();
    }

    @Get(':id')
    @Roles(Role.DEV, Role.ADMIN, Role.CHIEF_MONITOR)
    @ApiOperation({ summary: 'Get a monitor by ID' })
    @ApiResponse({ status: 200, description: 'Monitor details' })
    @ApiResponse({ status: 404, description: 'Monitor not found' })
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.monitorsService.findOne(id);
    }

    @Patch(':id')
    @Roles(Role.DEV, Role.ADMIN)
    @ApiOperation({ summary: 'Update a monitor' })
    @ApiResponse({ status: 200, description: 'Monitor updated successfully' })
    @ApiResponse({ status: 404, description: 'Monitor not found' })
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateMonitorDto: UpdateMonitorDto,
    ) {
        return this.monitorsService.update(id, updateMonitorDto);
    }

    @Patch(':id/password')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Update monitor password' })
    @ApiResponse({ status: 204, description: 'Password updated successfully' })
    @ApiResponse({ status: 400, description: 'Current password is incorrect' })
    @ApiResponse({ status: 404, description: 'Monitor not found' })
    updatePassword(
        @Param('id', ParseIntPipe) id: number,
        @Body() updatePasswordDto: UpdateMonitorPasswordDto,
    ) {
        return this.monitorsService.updatePassword(id, updatePasswordDto);
    }

    @Patch(':id/yearly-fee')
    @Roles(Role.DEV, Role.ADMIN)
    @ApiOperation({ summary: 'Update yearly fee status' })
    @ApiResponse({ status: 200, description: 'Yearly fee status updated' })
    @ApiResponse({ status: 404, description: 'Monitor not found' })
    updateYearlyFee(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateYearlyFeeDto: UpdateYearlyFeeDto,
    ) {
        return this.monitorsService.updateYearlyFeeStatus(
            id,
            updateYearlyFeeDto.paid,
            updateYearlyFeeDto.amount,
        );
    }

    @Delete(':id')
    @Roles(Role.DEV, Role.ADMIN)
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Delete a monitor' })
    @ApiResponse({ status: 204, description: 'Monitor deleted successfully' })
    @ApiResponse({ status: 404, description: 'Monitor not found' })
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.monitorsService.remove(id);
    }
}
