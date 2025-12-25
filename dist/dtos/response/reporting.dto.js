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
exports.Turning19ReportDto = exports.Turning19ChildDto = exports.YearlyAttendanceSummaryDto = exports.ActivityAttendanceStatsDto = exports.CountByKeyDto = exports.AttendanceByRoleDto = exports.AttendanceTotalsDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const activity_enum_1 = require("../../common/enums/activity.enum");
class AttendanceTotalsDto {
}
exports.AttendanceTotalsDto = AttendanceTotalsDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], AttendanceTotalsDto.prototype, "present", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], AttendanceTotalsDto.prototype, "absent", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], AttendanceTotalsDto.prototype, "total", void 0);
class AttendanceByRoleDto {
}
exports.AttendanceByRoleDto = AttendanceByRoleDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: AttendanceTotalsDto }),
    __metadata("design:type", AttendanceTotalsDto)
], AttendanceByRoleDto.prototype, "children", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: AttendanceTotalsDto }),
    __metadata("design:type", AttendanceTotalsDto)
], AttendanceByRoleDto.prototype, "monitors", void 0);
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
class ActivityAttendanceStatsDto {
}
exports.ActivityAttendanceStatsDto = ActivityAttendanceStatsDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], ActivityAttendanceStatsDto.prototype, "activityId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: activity_enum_1.ActivityType }),
    __metadata("design:type", String)
], ActivityAttendanceStatsDto.prototype, "activityType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: activity_enum_1.Town }),
    __metadata("design:type", String)
], ActivityAttendanceStatsDto.prototype, "activityTown", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], ActivityAttendanceStatsDto.prototype, "startDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], ActivityAttendanceStatsDto.prototype, "endDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Date)
], ActivityAttendanceStatsDto.prototype, "takenAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: AttendanceByRoleDto }),
    __metadata("design:type", AttendanceByRoleDto)
], ActivityAttendanceStatsDto.prototype, "totalsByRole", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total present attendees not registered in the system.' }),
    __metadata("design:type", Number)
], ActivityAttendanceStatsDto.prototype, "externalPresentCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Registered present + external present.' }),
    __metadata("design:type", Number)
], ActivityAttendanceStatsDto.prototype, "overallPresentCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [CountByKeyDto] }),
    __metadata("design:type", Array)
], ActivityAttendanceStatsDto.prototype, "byOriginTown", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [CountByKeyDto] }),
    __metadata("design:type", Array)
], ActivityAttendanceStatsDto.prototype, "byClassificationLabel", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [CountByKeyDto] }),
    __metadata("design:type", Array)
], ActivityAttendanceStatsDto.prototype, "byChildGroup", void 0);
class YearlyAttendanceSummaryDto {
}
exports.YearlyAttendanceSummaryDto = YearlyAttendanceSummaryDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], YearlyAttendanceSummaryDto.prototype, "year", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: AttendanceByRoleDto }),
    __metadata("design:type", AttendanceByRoleDto)
], YearlyAttendanceSummaryDto.prototype, "totalsByRole", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total present attendees not registered in the system.' }),
    __metadata("design:type", Number)
], YearlyAttendanceSummaryDto.prototype, "externalPresentCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Registered present + external present.' }),
    __metadata("design:type", Number)
], YearlyAttendanceSummaryDto.prototype, "overallPresentCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [CountByKeyDto] }),
    __metadata("design:type", Array)
], YearlyAttendanceSummaryDto.prototype, "byTown", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [CountByKeyDto] }),
    __metadata("design:type", Array)
], YearlyAttendanceSummaryDto.prototype, "byActivityType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [CountByKeyDto] }),
    __metadata("design:type", Array)
], YearlyAttendanceSummaryDto.prototype, "byClassificationLabel", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [CountByKeyDto] }),
    __metadata("design:type", Array)
], YearlyAttendanceSummaryDto.prototype, "byChildGroup", void 0);
class Turning19ChildDto {
}
exports.Turning19ChildDto = Turning19ChildDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], Turning19ChildDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], Turning19ChildDto.prototype, "fullName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], Turning19ChildDto.prototype, "dateOfBirth", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: activity_enum_1.Town }),
    __metadata("design:type", String)
], Turning19ChildDto.prototype, "originTown", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: activity_enum_1.ChildGroup }),
    __metadata("design:type", String)
], Turning19ChildDto.prototype, "groupAtTime", void 0);
class Turning19ReportDto {
}
exports.Turning19ReportDto = Turning19ReportDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], Turning19ReportDto.prototype, "year", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], Turning19ReportDto.prototype, "count", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [Turning19ChildDto] }),
    __metadata("design:type", Array)
], Turning19ReportDto.prototype, "children", void 0);
//# sourceMappingURL=reporting.dto.js.map