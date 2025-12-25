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
exports.UpsertAttendanceDto = exports.ExternalAttendanceEntryRequestDto = exports.AttendanceEntryRequestDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const attendance_enum_1 = require("../../common/enums/attendance.enum");
class AttendanceEntryRequestDto {
}
exports.AttendanceEntryRequestDto = AttendanceEntryRequestDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsMongoId)(),
    __metadata("design:type", String)
], AttendanceEntryRequestDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], AttendanceEntryRequestDto.prototype, "present", void 0);
class ExternalAttendanceEntryRequestDto {
}
exports.ExternalAttendanceEntryRequestDto = ExternalAttendanceEntryRequestDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: attendance_enum_1.ClassificationLabel }),
    (0, class_validator_1.IsEnum)(attendance_enum_1.ClassificationLabel),
    __metadata("design:type", String)
], ExternalAttendanceEntryRequestDto.prototype, "classificationLabel", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ExternalAttendanceEntryRequestDto.prototype, "externalId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    __metadata("design:type", String)
], ExternalAttendanceEntryRequestDto.prototype, "fullName", void 0);
class UpsertAttendanceDto {
}
exports.UpsertAttendanceDto = UpsertAttendanceDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: [AttendanceEntryRequestDto] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => AttendanceEntryRequestDto),
    __metadata("design:type", Array)
], UpsertAttendanceDto.prototype, "entries", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [ExternalAttendanceEntryRequestDto], required: false }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => ExternalAttendanceEntryRequestDto),
    __metadata("design:type", Array)
], UpsertAttendanceDto.prototype, "externalEntries", void 0);
//# sourceMappingURL=attendance.dto.js.map