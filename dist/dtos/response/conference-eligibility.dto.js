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
exports.ConferenceEligibilityResponseDto = exports.FlaggedConferenceChildDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class FlaggedConferenceChildDto {
}
exports.FlaggedConferenceChildDto = FlaggedConferenceChildDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], FlaggedConferenceChildDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], FlaggedConferenceChildDto.prototype, "reason", void 0);
class ConferenceEligibilityResponseDto {
}
exports.ConferenceEligibilityResponseDto = ConferenceEligibilityResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], ConferenceEligibilityResponseDto.prototype, "activityId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], ConferenceEligibilityResponseDto.prototype, "windowStart", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], ConferenceEligibilityResponseDto.prototype, "windowEnd", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], ConferenceEligibilityResponseDto.prototype, "invitedCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], ConferenceEligibilityResponseDto.prototype, "qualifiedCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], ConferenceEligibilityResponseDto.prototype, "flaggedCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [FlaggedConferenceChildDto] }),
    __metadata("design:type", Array)
], ConferenceEligibilityResponseDto.prototype, "flaggedChildren", void 0);
//# sourceMappingURL=conference-eligibility.dto.js.map