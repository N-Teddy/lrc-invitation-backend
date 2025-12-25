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
exports.InteractionContextParamsDto = exports.InteractionListQueryDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const notification_enum_1 = require("../../common/enums/notification.enum");
class InteractionListQueryDto {
}
exports.InteractionListQueryDto = InteractionListQueryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: 50, maximum: 200 }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(200),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], InteractionListQueryDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Pagination cursor (createdAt ms timestamp)' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], InteractionListQueryDto.prototype, "cursor", void 0);
class InteractionContextParamsDto {
}
exports.InteractionContextParamsDto = InteractionContextParamsDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: notification_enum_1.NotificationContextType }),
    (0, class_validator_1.IsEnum)(notification_enum_1.NotificationContextType),
    __metadata("design:type", String)
], InteractionContextParamsDto.prototype, "contextType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsMongoId)(),
    __metadata("design:type", String)
], InteractionContextParamsDto.prototype, "contextId", void 0);
//# sourceMappingURL=interaction.dto.js.map