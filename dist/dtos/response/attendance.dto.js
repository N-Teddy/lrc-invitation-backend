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
exports.AttendanceResponseDto = exports.ExternalAttendanceEntryResponseDto = exports.AttendanceEntryResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const attendance_enum_1 = require("../../common/enums/attendance.enum");
const activity_enum_1 = require("../../common/enums/activity.enum");
class AttendanceEntryResponseDto {
}
exports.AttendanceEntryResponseDto = AttendanceEntryResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], AttendanceEntryResponseDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], AttendanceEntryResponseDto.prototype, "present", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: attendance_enum_1.AttendanceRoleAtTime }),
    __metadata("design:type", String)
], AttendanceEntryResponseDto.prototype, "roleAtTime", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: activity_enum_1.Town }),
    __metadata("design:type", String)
], AttendanceEntryResponseDto.prototype, "originTownAtTime", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: activity_enum_1.ChildGroup }),
    __metadata("design:type", String)
], AttendanceEntryResponseDto.prototype, "groupAtTime", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: attendance_enum_1.ClassificationLabel }),
    __metadata("design:type", String)
], AttendanceEntryResponseDto.prototype, "classificationLabel", void 0);
class ExternalAttendanceEntryResponseDto {
}
exports.ExternalAttendanceEntryResponseDto = ExternalAttendanceEntryResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], ExternalAttendanceEntryResponseDto.prototype, "externalId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], ExternalAttendanceEntryResponseDto.prototype, "fullName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: attendance_enum_1.ClassificationLabel }),
    __metadata("design:type", String)
], ExternalAttendanceEntryResponseDto.prototype, "classificationLabel", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: activity_enum_1.Town }),
    __metadata("design:type", String)
], ExternalAttendanceEntryResponseDto.prototype, "scopeTown", void 0);
class AttendanceResponseDto {
}
exports.AttendanceResponseDto = AttendanceResponseDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], AttendanceResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], AttendanceResponseDto.prototype, "activityId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], AttendanceResponseDto.prototype, "takenByUserId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Date)
], AttendanceResponseDto.prototype, "takenAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [AttendanceEntryResponseDto] }),
    __metadata("design:type", Array)
], AttendanceResponseDto.prototype, "entries", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [ExternalAttendanceEntryResponseDto] }),
    __metadata("design:type", Array)
], AttendanceResponseDto.prototype, "externalEntries", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Date)
], AttendanceResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Date)
], AttendanceResponseDto.prototype, "updatedAt", void 0);
//# sourceMappingURL=attendance.dto.js.map