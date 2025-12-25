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
exports.GoogleSignInDto = exports.RefreshTokenDto = exports.MagicLinkRequestDto = exports.MagicLinkExchangeDto = exports.RegisterRequestDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const user_enum_1 = require("../../common/enums/user.enum");
const activity_enum_1 = require("../../common/enums/activity.enum");
class RegisterRequestDto {
    constructor() {
        this.whatsAppOptIn = true;
    }
}
exports.RegisterRequestDto = RegisterRequestDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RegisterRequestDto.prototype, "fullName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: 'Optional for email-only environments' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], RegisterRequestDto.prototype, "phoneE164", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], RegisterRequestDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        required: false,
        description: 'Preferred UI/notification language (e.g., en, fr)',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], RegisterRequestDto.prototype, "preferredLanguage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        enum: activity_enum_1.Town,
        required: false,
        description: 'Required for monitors; used for town scoping and approvals',
    }),
    (0, class_validator_1.IsEnum)(activity_enum_1.Town),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], RegisterRequestDto.prototype, "homeTown", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: user_enum_1.UserRole, enumName: 'UserRole' }),
    (0, class_validator_1.IsEnum)(user_enum_1.UserRole),
    __metadata("design:type", String)
], RegisterRequestDto.prototype, "role", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: user_enum_1.MonitorLevel, required: false }),
    (0, class_validator_1.IsEnum)(user_enum_1.MonitorLevel),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], RegisterRequestDto.prototype, "monitorLevel", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, default: true }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], RegisterRequestDto.prototype, "whatsAppOptIn", void 0);
class MagicLinkExchangeDto {
}
exports.MagicLinkExchangeDto = MagicLinkExchangeDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], MagicLinkExchangeDto.prototype, "token", void 0);
class MagicLinkRequestDto {
}
exports.MagicLinkRequestDto = MagicLinkRequestDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], MagicLinkRequestDto.prototype, "email", void 0);
class RefreshTokenDto {
}
exports.RefreshTokenDto = RefreshTokenDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RefreshTokenDto.prototype, "refreshToken", void 0);
class GoogleSignInDto {
}
exports.GoogleSignInDto = GoogleSignInDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GoogleSignInDto.prototype, "idToken", void 0);
//# sourceMappingURL=auth.dto.js.map