import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Town } from '../../common/enums/activity.enum';

export class PaymentResponseDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    monitorUserId: string;

    @ApiProperty()
    year: number;

    @ApiProperty()
    amountFcfa: number;

    @ApiProperty()
    paidAt: Date;

    @ApiPropertyOptional()
    recordedByUserId?: string;

    @ApiPropertyOptional()
    createdAt?: Date;

    @ApiPropertyOptional()
    updatedAt?: Date;
}

export class PaymentYearSummaryDto {
    @ApiProperty()
    monitorUserId: string;

    @ApiProperty()
    year: number;

    @ApiProperty()
    expectedFcfa: number;

    @ApiProperty()
    totalPaidFcfa: number;

    @ApiProperty({ description: 'expectedFcfa - totalPaidFcfa (negative means overpaid)' })
    balanceFcfa: number;
}

export class PaymentsListResponseDto {
    @ApiProperty({ type: [PaymentResponseDto] })
    items: PaymentResponseDto[];
}

export class MyPaymentsResponseDto {
    @ApiProperty({ type: [PaymentResponseDto] })
    items: PaymentResponseDto[];

    @ApiProperty({ type: PaymentYearSummaryDto })
    summary: PaymentYearSummaryDto;
}

export class CountByKeyDto {
    @ApiProperty()
    key: string;

    @ApiProperty()
    count: number;
}

export class PaymentTownOverviewDto {
    @ApiProperty({ enum: Town })
    town: Town;

    @ApiProperty()
    monitorsCount: number;

    @ApiProperty()
    totalPaidFcfa: number;

    @ApiProperty()
    unpaidCount: number;

    @ApiProperty()
    underpaidCount: number;

    @ApiProperty()
    exactCount: number;

    @ApiProperty()
    overpaidCount: number;
}

export class PaymentYearOverviewDto {
    @ApiProperty()
    year: number;

    @ApiProperty()
    expectedPerMonitorFcfa: number;

    @ApiProperty()
    monitorsCount: number;

    @ApiProperty()
    expectedTotalFcfa: number;

    @ApiProperty()
    totalPaidFcfa: number;

    @ApiProperty()
    balanceTotalFcfa: number;

    @ApiProperty()
    unpaidCount: number;

    @ApiProperty()
    underpaidCount: number;

    @ApiProperty()
    exactCount: number;

    @ApiProperty()
    overpaidCount: number;

    @ApiProperty({ type: [PaymentTownOverviewDto] })
    byTown: PaymentTownOverviewDto[];
}
