"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentYearOverviewDto = exports.PaymentTownOverviewDto = exports.CountByKeyDto = exports.MyPaymentsResponseDto = exports.PaymentsListResponseDto = exports.PaymentYearSummaryDto = exports.PaymentResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const activity_enum_1 = require("../../common/enums/activity.enum");
class PaymentResponseDto {
}
exports.PaymentResponseDto = PaymentResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], PaymentResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], PaymentResponseDto.prototype, "monitorUserId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], PaymentResponseDto.prototype, "year", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], PaymentResponseDto.prototype, "amountFcfa", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], PaymentResponseDto.prototype, "paidAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], PaymentResponseDto.prototype, "recordedByUserId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Date)
], PaymentResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Date)
], PaymentResponseDto.prototype, "updatedAt", void 0);
class PaymentYearSummaryDto {
}
exports.PaymentYearSummaryDto = PaymentYearSummaryDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], PaymentYearSummaryDto.prototype, "monitorUserId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], PaymentYearSummaryDto.prototype, "year", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], PaymentYearSummaryDto.prototype, "expectedFcfa", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], PaymentYearSummaryDto.prototype, "totalPaidFcfa", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'expectedFcfa - totalPaidFcfa (negative means overpaid)' }),
    __metadata("design:type", Number)
], PaymentYearSummaryDto.prototype, "balanceFcfa", void 0);
class PaymentsListResponseDto {
}
exports.PaymentsListResponseDto = PaymentsListResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: [PaymentResponseDto] }),
    __metadata("design:type", Array)
], PaymentsListResponseDto.prototype, "items", void 0);
class MyPaymentsResponseDto {
}
exports.MyPaymentsResponseDto = MyPaymentsResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: [PaymentResponseDto] }),
    __metadata("design:type", Array)
], MyPaymentsResponseDto.prototype, "items", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: PaymentYearSummaryDto }),
    __metadata("design:type", PaymentYearSummaryDto)
], MyPaymentsResponseDto.prototype, "summary", void 0);
class CountByKeyDto {
}
exports.CountByKeyDto = CountByKeyDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], CountByKeyDto.prototype, "key", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], CountByKeyDto.prototype, "count", void 0);
class PaymentTownOverviewDto {
}
exports.PaymentTownOverviewDto = PaymentTownOverviewDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: activity_enum_1.Town }),
    __metadata("design:type", String)
], PaymentTownOverviewDto.prototype, "town", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], PaymentTownOverviewDto.prototype, "monitorsCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], PaymentTownOverviewDto.prototype, "totalPaidFcfa", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], PaymentTownOverviewDto.prototype, "unpaidCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], PaymentTownOverviewDto.prototype, "underpaidCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], PaymentTownOverviewDto.prototype, "exactCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], PaymentTownOverviewDto.prototype, "overpaidCount", void 0);
class PaymentYearOverviewDto {
}
exports.PaymentYearOverviewDto = PaymentYearOverviewDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], PaymentYearOverviewDto.prototype, "year", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], PaymentYearOverviewDto.prototype, "expectedPerMonitorFcfa", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], PaymentYearOverviewDto.prototype, "monitorsCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], PaymentYearOverviewDto.prototype, "expectedTotalFcfa", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], PaymentYearOverviewDto.prototype, "totalPaidFcfa", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], PaymentYearOverviewDto.prototype, "balanceTotalFcfa", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], PaymentYearOverviewDto.prototype, "unpaidCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], PaymentYearOverviewDto.prototype, "underpaidCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], PaymentYearOverviewDto.prototype, "exactCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], PaymentYearOverviewDto.prototype, "overpaidCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [PaymentTownOverviewDto] }),
    __metadata("design:type", Array)
], PaymentYearOverviewDto.prototype, "byTown", void 0);
//# sourceMappingURL=payment.dto.js.map