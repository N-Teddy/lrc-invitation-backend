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
exports.UpdateActivityInvitationsDto = exports.UpdateActivityDto = exports.CreateActivityDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const activity_enum_1 = require("../../common/enums/activity.enum");
class CreateActivityDto {
}
exports.CreateActivityDto = CreateActivityDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: activity_enum_1.ActivityType }),
    (0, class_validator_1.IsEnum)(activity_enum_1.ActivityType),
    __metadata("design:type", String)
], CreateActivityDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        enum: activity_enum_1.Town,
        description: 'Derived from the creator town for non-conferences',
    }),
    (0, class_validator_1.IsEnum)(activity_enum_1.Town),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateActivityDto.prototype, "town", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateActivityDto.prototype, "startDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateActivityDto.prototype, "endDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Required for conferences (2 or 5).', minimum: 1 }),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateActivityDto.prototype, "conferenceDurationDays", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: activity_enum_1.TargetingCode }),
    (0, class_validator_1.IsEnum)(activity_enum_1.TargetingCode),
    __metadata("design:type", String)
], CreateActivityDto.prototype, "targetingCode", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateActivityDto.prototype, "notes", void 0);
class UpdateActivityDto extends (0, swagger_1.PartialType)(CreateActivityDto) {
}
exports.UpdateActivityDto = UpdateActivityDto;
class UpdateActivityInvitationsDto {
}
exports.UpdateActivityInvitationsDto = UpdateActivityInvitationsDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [String] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsMongoId)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], UpdateActivityInvitationsDto.prototype, "invitedChildrenUserIds", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [String] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsMongoId)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], UpdateActivityInvitationsDto.prototype, "invitedMonitorUserIds", void 0);
//# sourceMappingURL=activity.dto.js.map