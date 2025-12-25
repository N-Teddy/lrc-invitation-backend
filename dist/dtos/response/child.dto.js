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
exports.ChildrenListResponseDto = exports.BulkCreateChildrenResponseDto = exports.ChildResponseDto = exports.GuardianResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const activity_enum_1 = require("../../common/enums/activity.enum");
const user_dto_1 = require("./user.dto");
class GuardianResponseDto {
}
exports.GuardianResponseDto = GuardianResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], GuardianResponseDto.prototype, "fullName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], GuardianResponseDto.prototype, "phoneE164", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], GuardianResponseDto.prototype, "relationship", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], GuardianResponseDto.prototype, "email", void 0);
class ChildResponseDto extends user_dto_1.UserResponseDto {
}
exports.ChildResponseDto = ChildResponseDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: activity_enum_1.ChildGroup }),
    __metadata("design:type", String)
], ChildResponseDto.prototype, "group", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [GuardianResponseDto] }),
    __metadata("design:type", Array)
], ChildResponseDto.prototype, "guardians", void 0);
class BulkCreateChildrenResponseDto {
}
exports.BulkCreateChildrenResponseDto = BulkCreateChildrenResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: [ChildResponseDto] }),
    __metadata("design:type", Array)
], BulkCreateChildrenResponseDto.prototype, "created", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: [Object],
        description: 'Per-item validation failures; successful items are still created.',
    }),
    __metadata("design:type", Array)
], BulkCreateChildrenResponseDto.prototype, "errors", void 0);
class ChildrenListResponseDto {
}
exports.ChildrenListResponseDto = ChildrenListResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: [ChildResponseDto] }),
    __metadata("design:type", Array)
], ChildrenListResponseDto.prototype, "items", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], ChildrenListResponseDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], ChildrenListResponseDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], ChildrenListResponseDto.prototype, "total", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Count of children in scope missing profile image.' }),
    __metadata("design:type", Number)
], ChildrenListResponseDto.prototype, "missingProfileImageCount", void 0);
//# sourceMappingURL=child.dto.js.map