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
exports.SetMediaStorageRequestDto = exports.SetNotificationRecipientsRequestDto = exports.NotificationRecipientsRuleRequestDto = exports.RecipientSelectorRequestDto = exports.SetLanguagesRequestDto = exports.SetClassificationLabelsRequestDto = exports.SetAgeToGroupMappingRequestDto = exports.AgeBandRequestDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const activity_enum_1 = require("../../common/enums/activity.enum");
const attendance_enum_1 = require("../../common/enums/attendance.enum");
const settings_enum_1 = require("../../common/enums/settings.enum");
class AgeBandRequestDto {
}
exports.AgeBandRequestDto = AgeBandRequestDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: activity_enum_1.ChildGroup }),
    (0, class_validator_1.IsEnum)(activity_enum_1.ChildGroup),
    __metadata("design:type", String)
], AgeBandRequestDto.prototype, "group", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ minimum: 0 }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], AgeBandRequestDto.prototype, "minAgeYears", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ minimum: 0 }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(200),
    __metadata("design:type", Number)
], AgeBandRequestDto.prototype, "maxAgeYears", void 0);
class SetAgeToGroupMappingRequestDto {
}
exports.SetAgeToGroupMappingRequestDto = SetAgeToGroupMappingRequestDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: [AgeBandRequestDto] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => AgeBandRequestDto),
    __metadata("design:type", Array)
], SetAgeToGroupMappingRequestDto.prototype, "bands", void 0);
class SetClassificationLabelsRequestDto {
}
exports.SetClassificationLabelsRequestDto = SetClassificationLabelsRequestDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: [String], enum: attendance_enum_1.ClassificationLabel }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsEnum)(attendance_enum_1.ClassificationLabel, { each: true }),
    __metadata("design:type", Array)
], SetClassificationLabelsRequestDto.prototype, "labels", void 0);
class SetLanguagesRequestDto {
}
exports.SetLanguagesRequestDto = SetLanguagesRequestDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: ['en', 'fr'] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], SetLanguagesRequestDto.prototype, "supportedLanguages", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'en' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SetLanguagesRequestDto.prototype, "defaultLanguage", void 0);
class RecipientSelectorRequestDto {
}
exports.RecipientSelectorRequestDto = RecipientSelectorRequestDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: settings_enum_1.RecipientSelectorType }),
    (0, class_validator_1.IsEnum)(settings_enum_1.RecipientSelectorType),
    __metadata("design:type", String)
], RecipientSelectorRequestDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, type: [String] }),
    (0, class_validator_1.ValidateIf)((v) => v.type === settings_enum_1.RecipientSelectorType.ExplicitUsers),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsMongoId)({ each: true }),
    __metadata("design:type", Array)
], RecipientSelectorRequestDto.prototype, "userIds", void 0);
class NotificationRecipientsRuleRequestDto {
}
exports.NotificationRecipientsRuleRequestDto = NotificationRecipientsRuleRequestDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'group_change' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], NotificationRecipientsRuleRequestDto.prototype, "kind", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: activity_enum_1.Town, required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(activity_enum_1.Town),
    __metadata("design:type", String)
], NotificationRecipientsRuleRequestDto.prototype, "town", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [RecipientSelectorRequestDto] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => RecipientSelectorRequestDto),
    __metadata("design:type", Array)
], NotificationRecipientsRuleRequestDto.prototype, "selectors", void 0);
class SetNotificationRecipientsRequestDto {
}
exports.SetNotificationRecipientsRequestDto = SetNotificationRecipientsRequestDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: [NotificationRecipientsRuleRequestDto] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => NotificationRecipientsRuleRequestDto),
    __metadata("design:type", Array)
], SetNotificationRecipientsRequestDto.prototype, "rules", void 0);
class SetMediaStorageRequestDto {
}
exports.SetMediaStorageRequestDto = SetMediaStorageRequestDto;
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, enum: ['local', 'cloudinary'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['local', 'cloudinary']),
    __metadata("design:type", String)
], SetMediaStorageRequestDto.prototype, "providerHint", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, example: 5_000_000 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], SetMediaStorageRequestDto.prototype, "maxSizeBytes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, example: ['image/jpeg', 'image/png', 'image/webp'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], SetMediaStorageRequestDto.prototype, "allowedMimeTypes", void 0);
//# sourceMappingURL=settings.dto.js.map