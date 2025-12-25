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
exports.AttendanceEligibleChildrenResponseDto = exports.AttendanceEligibleChildDto = exports.AttendanceRosterResponseDto = exports.AttendanceRosterParticipantDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const attendance_enum_1 = require("../../common/enums/attendance.enum");
const activity_enum_1 = require("../../common/enums/activity.enum");
const PARTICIPANT_ROLES = [...Object.values(attendance_enum_1.AttendanceRoleAtTime), 'external'];
class AttendanceRosterParticipantDto {
}
exports.AttendanceRosterParticipantDto = AttendanceRosterParticipantDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], AttendanceRosterParticipantDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], AttendanceRosterParticipantDto.prototype, "fullName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: PARTICIPANT_ROLES }),
    __metadata("design:type", Object)
], AttendanceRosterParticipantDto.prototype, "role", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: activity_enum_1.ChildGroup }),
    __metadata("design:type", String)
], AttendanceRosterParticipantDto.prototype, "group", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], AttendanceRosterParticipantDto.prototype, "profileImageUrl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: attendance_enum_1.ClassificationLabel }),
    __metadata("design:type", String)
], AttendanceRosterParticipantDto.prototype, "classificationLabel", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Boolean)
], AttendanceRosterParticipantDto.prototype, "present", void 0);
class AttendanceRosterResponseDto {
}
exports.AttendanceRosterResponseDto = AttendanceRosterResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], AttendanceRosterResponseDto.prototype, "activityId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: activity_enum_1.ActivityType }),
    __metadata("design:type", String)
], AttendanceRosterResponseDto.prototype, "activityType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: activity_enum_1.Town }),
    __metadata("design:type", String)
], AttendanceRosterResponseDto.prototype, "activityTown", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: activity_enum_1.TargetingCode }),
    __metadata("design:type", String)
], AttendanceRosterResponseDto.prototype, "targetingCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], AttendanceRosterResponseDto.prototype, "startDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], AttendanceRosterResponseDto.prototype, "endDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        enum: activity_enum_1.Town,
        description: 'Only set for conferences (per-town attendance).',
    }),
    __metadata("design:type", String)
], AttendanceRosterResponseDto.prototype, "scopeTown", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Date)
], AttendanceRosterResponseDto.prototype, "takenAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'True when attendance cannot be changed anymore.' }),
    __metadata("design:type", Boolean)
], AttendanceRosterResponseDto.prototype, "locked", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], AttendanceRosterResponseDto.prototype, "lockReason", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [String], enum: attendance_enum_1.ClassificationLabel }),
    __metadata("design:type", Array)
], AttendanceRosterResponseDto.prototype, "classificationLabels", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [AttendanceRosterParticipantDto] }),
    __metadata("design:type", Array)
], AttendanceRosterResponseDto.prototype, "participants", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Convenience list of external entries already recorded for this activity.',
    }),
    __metadata("design:type", Array)
], AttendanceRosterResponseDto.prototype, "externalEntries", void 0);
class AttendanceEligibleChildDto {
}
exports.AttendanceEligibleChildDto = AttendanceEligibleChildDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], AttendanceEligibleChildDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], AttendanceEligibleChildDto.prototype, "fullName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: activity_enum_1.ChildGroup }),
    __metadata("design:type", String)
], AttendanceEligibleChildDto.prototype, "group", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], AttendanceEligibleChildDto.prototype, "profileImageUrl", void 0);
class AttendanceEligibleChildrenResponseDto {
}
exports.AttendanceEligibleChildrenResponseDto = AttendanceEligibleChildrenResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], AttendanceEligibleChildrenResponseDto.prototype, "activityId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], AttendanceEligibleChildrenResponseDto.prototype, "query", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: activity_enum_1.Town }),
    __metadata("design:type", String)
], AttendanceEligibleChildrenResponseDto.prototype, "scopeTown", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [AttendanceEligibleChildDto] }),
    __metadata("design:type", Array)
], AttendanceEligibleChildrenResponseDto.prototype, "results", void 0);
//# sourceMappingURL=attendance-roster.dto.js.map