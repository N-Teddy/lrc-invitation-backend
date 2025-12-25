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
exports.BulkCreateChildrenDto = exports.CreateChildMultipartDto = exports.CreateChildDto = exports.GuardianDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
class GuardianDto {
}
exports.GuardianDto = GuardianDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GuardianDto.prototype, "fullName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Phone number in E.164 format (example: +237693087159)' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GuardianDto.prototype, "phoneE164", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Relationship to the child (example: Mother, Father, Guardian)' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GuardianDto.prototype, "relationship", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], GuardianDto.prototype, "email", void 0);
class CreateChildDto {
}
exports.CreateChildDto = CreateChildDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateChildDto.prototype, "fullName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Required. ISO date string (YYYY-MM-DD recommended).' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateChildDto.prototype, "dateOfBirth", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: [GuardianDto],
        description: 'At least one parent/guardian contact is required.',
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(1),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => GuardianDto),
    __metadata("design:type", Array)
], CreateChildDto.prototype, "guardians", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Optional. Defaults to English.' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateChildDto.prototype, "preferredLanguage", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateChildDto.prototype, "whatsAppPhoneE164", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: true }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateChildDto.prototype, "whatsAppOptIn", void 0);
class CreateChildMultipartDto {
}
exports.CreateChildMultipartDto = CreateChildMultipartDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateChildMultipartDto.prototype, "fullName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Required. ISO date string (YYYY-MM-DD recommended).' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateChildMultipartDto.prototype, "dateOfBirth", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'JSON stringified guardians array (at least 1). Example: [{"fullName":"...","phoneE164":"+237...","relationship":"Mother"}]',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateChildMultipartDto.prototype, "guardiansJson", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Optional. Defaults to English.' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateChildMultipartDto.prototype, "preferredLanguage", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateChildMultipartDto.prototype, "whatsAppPhoneE164", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: true }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateChildMultipartDto.prototype, "whatsAppOptIn", void 0);
class BulkCreateChildrenDto {
}
exports.BulkCreateChildrenDto = BulkCreateChildrenDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: [CreateChildDto] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => CreateChildDto),
    __metadata("design:type", Array)
], BulkCreateChildrenDto.prototype, "children", void 0);
//# sourceMappingURL=child.dto.js.map