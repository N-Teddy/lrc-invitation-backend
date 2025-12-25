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
exports.RemindersListResponseDto = exports.ReminderResponseDto = exports.ReminderScheduleResponseDto = exports.ReminderExpectedResponseResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const notification_enum_1 = require("../../common/enums/notification.enum");
const reminder_schema_1 = require("../../schema/reminder.schema");
class ReminderExpectedResponseResponseDto {
}
exports.ReminderExpectedResponseResponseDto = ReminderExpectedResponseResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], ReminderExpectedResponseResponseDto.prototype, "label", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], ReminderExpectedResponseResponseDto.prototype, "value", void 0);
class ReminderScheduleResponseDto {
}
exports.ReminderScheduleResponseDto = ReminderScheduleResponseDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: reminder_schema_1.ReminderScheduleType }),
    __metadata("design:type", String)
], ReminderScheduleResponseDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Date)
], ReminderScheduleResponseDto.prototype, "runAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Number)
], ReminderScheduleResponseDto.prototype, "intervalMinutes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Number)
], ReminderScheduleResponseDto.prototype, "hour", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Number)
], ReminderScheduleResponseDto.prototype, "minute", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Number)
], ReminderScheduleResponseDto.prototype, "dayOfWeek", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Number)
], ReminderScheduleResponseDto.prototype, "dayOfMonth", void 0);
class ReminderResponseDto {
}
exports.ReminderResponseDto = ReminderResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], ReminderResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: notification_enum_1.ReminderKind }),
    __metadata("design:type", String)
], ReminderResponseDto.prototype, "kind", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], ReminderResponseDto.prototype, "createdByUserId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], ReminderResponseDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: notification_enum_1.Channel }),
    __metadata("design:type", String)
], ReminderResponseDto.prototype, "channel", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: ReminderScheduleResponseDto }),
    __metadata("design:type", ReminderScheduleResponseDto)
], ReminderResponseDto.prototype, "schedule", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Date)
], ReminderResponseDto.prototype, "nextRunAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Date)
], ReminderResponseDto.prototype, "lastSentAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [String] }),
    __metadata("design:type", Array)
], ReminderResponseDto.prototype, "recipients", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [String] }),
    __metadata("design:type", Array)
], ReminderResponseDto.prototype, "awaitingAckUserIds", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [String] }),
    __metadata("design:type", Array)
], ReminderResponseDto.prototype, "acknowledgedByUserIds", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [ReminderExpectedResponseResponseDto] }),
    __metadata("design:type", Array)
], ReminderResponseDto.prototype, "expectedResponses", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: notification_enum_1.ReminderStatus }),
    __metadata("design:type", String)
], ReminderResponseDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], ReminderResponseDto.prototype, "context", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Date)
], ReminderResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Date)
], ReminderResponseDto.prototype, "updatedAt", void 0);
class RemindersListResponseDto {
}
exports.RemindersListResponseDto = RemindersListResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: [ReminderResponseDto] }),
    __metadata("design:type", Array)
], RemindersListResponseDto.prototype, "items", void 0);
//# sourceMappingURL=reminder.dto.js.map