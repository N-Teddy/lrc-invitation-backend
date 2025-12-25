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
exports.RespondReminderDto = exports.UpdateReminderDto = exports.CreateReminderDto = exports.ReminderScheduleDto = exports.ReminderExpectedResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const notification_enum_1 = require("../../common/enums/notification.enum");
const reminder_schema_1 = require("../../schema/reminder.schema");
class ReminderExpectedResponseDto {
}
exports.ReminderExpectedResponseDto = ReminderExpectedResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReminderExpectedResponseDto.prototype, "label", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReminderExpectedResponseDto.prototype, "value", void 0);
class ReminderScheduleDto {
}
exports.ReminderScheduleDto = ReminderScheduleDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: reminder_schema_1.ReminderScheduleType }),
    (0, class_validator_1.IsEnum)(reminder_schema_1.ReminderScheduleType),
    __metadata("design:type", String)
], ReminderScheduleDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'For once: ISO datetime' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ReminderScheduleDto.prototype, "runAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'For interval_minutes' }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], ReminderScheduleDto.prototype, "intervalMinutes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'For daily/weekly/monthly' }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(23),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], ReminderScheduleDto.prototype, "hour", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'For daily/weekly/monthly' }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(59),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], ReminderScheduleDto.prototype, "minute", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'For weekly (0=Sun..6=Sat)' }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(6),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], ReminderScheduleDto.prototype, "dayOfWeek", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'For monthly (1..31)' }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(31),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], ReminderScheduleDto.prototype, "dayOfMonth", void 0);
class CreateReminderDto {
}
exports.CreateReminderDto = CreateReminderDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateReminderDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [String], description: 'User IDs' }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsMongoId)({ each: true }),
    __metadata("design:type", Array)
], CreateReminderDto.prototype, "recipients", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: notification_enum_1.Channel, default: notification_enum_1.Channel.WhatsApp }),
    (0, class_validator_1.IsEnum)(notification_enum_1.Channel),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateReminderDto.prototype, "channel", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: ReminderScheduleDto }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => ReminderScheduleDto),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", ReminderScheduleDto)
], CreateReminderDto.prototype, "schedule", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [ReminderExpectedResponseDto] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => ReminderExpectedResponseDto),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateReminderDto.prototype, "expectedResponses", void 0);
class UpdateReminderDto {
}
exports.UpdateReminderDto = UpdateReminderDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateReminderDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [String], description: 'User IDs' }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsMongoId)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], UpdateReminderDto.prototype, "recipients", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: notification_enum_1.Channel }),
    (0, class_validator_1.IsEnum)(notification_enum_1.Channel),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateReminderDto.prototype, "channel", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: ReminderScheduleDto }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => ReminderScheduleDto),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", ReminderScheduleDto)
], UpdateReminderDto.prototype, "schedule", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [ReminderExpectedResponseDto] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => ReminderExpectedResponseDto),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], UpdateReminderDto.prototype, "expectedResponses", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: notification_enum_1.ReminderStatus }),
    (0, class_validator_1.IsEnum)(notification_enum_1.ReminderStatus),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateReminderDto.prototype, "status", void 0);
class RespondReminderDto {
}
exports.RespondReminderDto = RespondReminderDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RespondReminderDto.prototype, "value", void 0);
//# sourceMappingURL=reminder.dto.js.map