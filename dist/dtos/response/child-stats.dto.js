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
exports.ChildStatsResponseDto = exports.ChildAttendanceTypeBreakdownDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const activity_enum_1 = require("../../common/enums/activity.enum");
class ChildAttendanceTypeBreakdownDto {
}
exports.ChildAttendanceTypeBreakdownDto = ChildAttendanceTypeBreakdownDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: activity_enum_1.ActivityType }),
    __metadata("design:type", String)
], ChildAttendanceTypeBreakdownDto.prototype, "activityType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], ChildAttendanceTypeBreakdownDto.prototype, "totalRecords", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], ChildAttendanceTypeBreakdownDto.prototype, "presentCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], ChildAttendanceTypeBreakdownDto.prototype, "absentCount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Date)
], ChildAttendanceTypeBreakdownDto.prototype, "lastPresentAt", void 0);
class ChildStatsResponseDto {
}
exports.ChildStatsResponseDto = ChildStatsResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], ChildStatsResponseDto.prototype, "childId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], ChildStatsResponseDto.prototype, "totalAttendanceRecords", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], ChildStatsResponseDto.prototype, "presentCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], ChildStatsResponseDto.prototype, "absentCount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Date)
], ChildStatsResponseDto.prototype, "lastAttendanceAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Date)
], ChildStatsResponseDto.prototype, "lastPresentAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [ChildAttendanceTypeBreakdownDto] }),
    __metadata("design:type", Array)
], ChildStatsResponseDto.prototype, "byActivityType", void 0);
//# sourceMappingURL=child-stats.dto.js.map