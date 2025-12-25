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
exports.InteractionEventsListResponseDto = exports.InteractionEventDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const notification_enum_1 = require("../../common/enums/notification.enum");
class InteractionEventDto {
}
exports.InteractionEventDto = InteractionEventDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], InteractionEventDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], InteractionEventDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], InteractionEventDto.prototype, "userName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    __metadata("design:type", String)
], InteractionEventDto.prototype, "notificationId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: notification_enum_1.NotificationContextType }),
    __metadata("design:type", String)
], InteractionEventDto.prototype, "contextType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], InteractionEventDto.prototype, "contextId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], InteractionEventDto.prototype, "actionId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    __metadata("design:type", Object)
], InteractionEventDto.prototype, "meta", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], InteractionEventDto.prototype, "createdAt", void 0);
class InteractionEventsListResponseDto {
}
exports.InteractionEventsListResponseDto = InteractionEventsListResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: [InteractionEventDto] }),
    __metadata("design:type", Array)
], InteractionEventsListResponseDto.prototype, "items", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: 'Next cursor (createdAt ms timestamp)' }),
    __metadata("design:type", String)
], InteractionEventsListResponseDto.prototype, "nextCursor", void 0);
//# sourceMappingURL=interaction.dto.js.map