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
exports.ActivityEligibleChildrenResponseDto = exports.ActivityInvitedChildrenResponseDto = exports.InvitedChildCardDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const activity_enum_1 = require("../../common/enums/activity.enum");
class InvitedChildCardDto {
}
exports.InvitedChildCardDto = InvitedChildCardDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], InvitedChildCardDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], InvitedChildCardDto.prototype, "fullName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: activity_enum_1.ChildGroup }),
    __metadata("design:type", String)
], InvitedChildCardDto.prototype, "group", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], InvitedChildCardDto.prototype, "profileImageUrl", void 0);
class ActivityInvitedChildrenResponseDto {
}
exports.ActivityInvitedChildrenResponseDto = ActivityInvitedChildrenResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], ActivityInvitedChildrenResponseDto.prototype, "activityId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: activity_enum_1.ChildGroup, isArray: true }),
    __metadata("design:type", Array)
], ActivityInvitedChildrenResponseDto.prototype, "targetGroups", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [InvitedChildCardDto] }),
    __metadata("design:type", Array)
], ActivityInvitedChildrenResponseDto.prototype, "invited", void 0);
class ActivityEligibleChildrenResponseDto {
}
exports.ActivityEligibleChildrenResponseDto = ActivityEligibleChildrenResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], ActivityEligibleChildrenResponseDto.prototype, "activityId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], ActivityEligibleChildrenResponseDto.prototype, "query", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: activity_enum_1.ChildGroup, isArray: true }),
    __metadata("design:type", Array)
], ActivityEligibleChildrenResponseDto.prototype, "targetGroups", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [InvitedChildCardDto] }),
    __metadata("design:type", Array)
], ActivityEligibleChildrenResponseDto.prototype, "results", void 0);
//# sourceMappingURL=activity-invitations.dto.js.map