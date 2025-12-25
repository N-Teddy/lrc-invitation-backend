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
exports.MediaStorageResponseDto = exports.NotificationRecipientsResponseDto = exports.NotificationRecipientsRuleResponseDto = exports.RecipientSelectorResponseDto = exports.LanguagesResponseDto = exports.ClassificationLabelsResponseDto = exports.AgeToGroupMappingResponseDto = exports.AgeBandResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const activity_enum_1 = require("../../common/enums/activity.enum");
const attendance_enum_1 = require("../../common/enums/attendance.enum");
class AgeBandResponseDto {
}
exports.AgeBandResponseDto = AgeBandResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: activity_enum_1.ChildGroup }),
    __metadata("design:type", String)
], AgeBandResponseDto.prototype, "group", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], AgeBandResponseDto.prototype, "minAgeYears", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], AgeBandResponseDto.prototype, "maxAgeYears", void 0);
class AgeToGroupMappingResponseDto {
}
exports.AgeToGroupMappingResponseDto = AgeToGroupMappingResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: [AgeBandResponseDto] }),
    __metadata("design:type", Array)
], AgeToGroupMappingResponseDto.prototype, "bands", void 0);
class ClassificationLabelsResponseDto {
}
exports.ClassificationLabelsResponseDto = ClassificationLabelsResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: [String], enum: attendance_enum_1.ClassificationLabel }),
    __metadata("design:type", Array)
], ClassificationLabelsResponseDto.prototype, "labels", void 0);
class LanguagesResponseDto {
}
exports.LanguagesResponseDto = LanguagesResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: ['en', 'fr'] }),
    __metadata("design:type", Array)
], LanguagesResponseDto.prototype, "supportedLanguages", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'en' }),
    __metadata("design:type", String)
], LanguagesResponseDto.prototype, "defaultLanguage", void 0);
class RecipientSelectorResponseDto {
}
exports.RecipientSelectorResponseDto = RecipientSelectorResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'super_monitors' }),
    __metadata("design:type", String)
], RecipientSelectorResponseDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, type: [String] }),
    __metadata("design:type", Array)
], RecipientSelectorResponseDto.prototype, "userIds", void 0);
class NotificationRecipientsRuleResponseDto {
}
exports.NotificationRecipientsRuleResponseDto = NotificationRecipientsRuleResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], NotificationRecipientsRuleResponseDto.prototype, "kind", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: activity_enum_1.Town, required: false }),
    __metadata("design:type", String)
], NotificationRecipientsRuleResponseDto.prototype, "town", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [RecipientSelectorResponseDto] }),
    __metadata("design:type", Array)
], NotificationRecipientsRuleResponseDto.prototype, "selectors", void 0);
class NotificationRecipientsResponseDto {
}
exports.NotificationRecipientsResponseDto = NotificationRecipientsResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: [NotificationRecipientsRuleResponseDto] }),
    __metadata("design:type", Array)
], NotificationRecipientsResponseDto.prototype, "rules", void 0);
class MediaStorageResponseDto {
}
exports.MediaStorageResponseDto = MediaStorageResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, enum: ['local', 'cloudinary'] }),
    __metadata("design:type", String)
], MediaStorageResponseDto.prototype, "providerHint", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    __metadata("design:type", Number)
], MediaStorageResponseDto.prototype, "maxSizeBytes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, type: [String] }),
    __metadata("design:type", Array)
], MediaStorageResponseDto.prototype, "allowedMimeTypes", void 0);
//# sourceMappingURL=settings.dto.js.map