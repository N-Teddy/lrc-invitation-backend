import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { MonitorLevel, UserRole } from '../common/enums/user.enum';
import { CreatePaymentDto, PaymentsQueryDto, UpdatePaymentDto } from '../dtos/request/payment.dto';
import {
    MyPaymentsResponseDto,
    PaymentResponseDto,
    PaymentYearOverviewDto,
    PaymentYearSummaryDto,
    PaymentsListResponseDto,
} from '../dtos/response/payment.dto';
import { PaymentsService } from './payments.service';

@ApiBearerAuth()
@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
    constructor(private readonly paymentsService: PaymentsService) {}

    @Roles([UserRole.Monitor], [MonitorLevel.Super])
    @Post()
    @ApiCreatedResponse({ type: PaymentResponseDto })
    create(@Body() dto: CreatePaymentDto, @CurrentUser() currentUser: any) {
        return this.paymentsService.create(dto, currentUser);
    }

    @Roles([UserRole.Monitor], [MonitorLevel.Super])
    @Get()
    @ApiOkResponse({ type: PaymentsListResponseDto })
    async findAll(@Query() query: PaymentsQueryDto, @CurrentUser() currentUser: any) {
        const items = await this.paymentsService.findAll(query, currentUser);
        return { items };
    }

    @Roles([UserRole.Monitor])
    @Get('me')
    @ApiOkResponse({ type: MyPaymentsResponseDto })
    myPayments(@Query('year') year?: string, @CurrentUser() currentUser: any) {
        const y = year ? Number(year) : undefined;
        return this.paymentsService.findMine(y, currentUser);
    }

    @Roles([UserRole.Monitor], [MonitorLevel.Super])
    @Get('summary')
    @ApiOkResponse({ type: PaymentYearSummaryDto })
    summary(
        @Query('monitorUserId') monitorUserId: string,
        @Query('year') year: string,
        @CurrentUser() currentUser: any,
    ) {
        return this.paymentsService.getSummary(monitorUserId, Number(year), currentUser);
    }

    @Roles([UserRole.Monitor], [MonitorLevel.Super])
    @Get('yearly/:year/overview')
    @ApiOkResponse({ type: PaymentYearOverviewDto })
    yearlyOverview(@Param('year') year: string, @CurrentUser() currentUser: any) {
        return this.paymentsService.yearlyOverview(Number(year), currentUser);
    }

    @Roles([UserRole.Monitor], [MonitorLevel.Super])
    @Patch(':id')
    @ApiOkResponse({ type: PaymentResponseDto })
    update(@Param('id') id: string, @Body() dto: UpdatePaymentDto, @CurrentUser() currentUser: any) {
        return this.paymentsService.update(id, dto, currentUser);
    }

    @Roles([UserRole.Monitor], [MonitorLevel.Super])
    @Delete(':id')
    @ApiOkResponse()
    remove(@Param('id') id: string, @CurrentUser() currentUser: any) {
        return this.paymentsService.remove(id, currentUser);
    }
}

