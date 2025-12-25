export declare class CreatePaymentDto {
    monitorUserId: string;
    year: number;
    amountFcfa: number;
    paidAt: string;
}
declare const UpdatePaymentDto_base: import("@nestjs/common").Type<Partial<CreatePaymentDto>>;
export declare class UpdatePaymentDto extends UpdatePaymentDto_base {
}
export declare class PaymentsQueryDto {
    monitorUserId?: string;
    year?: number;
}
export {};
