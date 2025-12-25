import { Town } from '../../common/enums/activity.enum';
export declare class PaymentResponseDto {
    id: string;
    monitorUserId: string;
    year: number;
    amountFcfa: number;
    paidAt: Date;
    recordedByUserId?: string;
    createdAt?: Date;
    updatedAt?: Date;
}
export declare class PaymentYearSummaryDto {
    monitorUserId: string;
    year: number;
    expectedFcfa: number;
    totalPaidFcfa: number;
    balanceFcfa: number;
}
export declare class PaymentsListResponseDto {
    items: PaymentResponseDto[];
}
export declare class MyPaymentsResponseDto {
    items: PaymentResponseDto[];
    summary: PaymentYearSummaryDto;
}
export declare class CountByKeyDto {
    key: string;
    count: number;
}
export declare class PaymentTownOverviewDto {
    town: Town;
    monitorsCount: number;
    totalPaidFcfa: number;
    unpaidCount: number;
    underpaidCount: number;
    exactCount: number;
    overpaidCount: number;
}
export declare class PaymentYearOverviewDto {
    year: number;
    expectedPerMonitorFcfa: number;
    monitorsCount: number;
    expectedTotalFcfa: number;
    totalPaidFcfa: number;
    balanceTotalFcfa: number;
    unpaidCount: number;
    underpaidCount: number;
    exactCount: number;
    overpaidCount: number;
    byTown: PaymentTownOverviewDto[];
}
