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
exports.GroupRecomputeResultDto = exports.AgeToGroupMappingResponseDto = exports.AgeBandDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const activity_enum_1 = require("../../common/enums/activity.enum");
class AgeBandDto {
}
exports.AgeBandDto = AgeBandDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: activity_enum_1.ChildGroup }),
    __metadata("design:type", String)
], AgeBandDto.prototype, "group", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], AgeBandDto.prototype, "minAgeYears", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], AgeBandDto.prototype, "maxAgeYears", void 0);
class AgeToGroupMappingResponseDto {
}
exports.AgeToGroupMappingResponseDto = AgeToGroupMappingResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: [AgeBandDto] }),
    __metadata("design:type", Array)
], AgeToGroupMappingResponseDto.prototype, "bands", void 0);
class GroupRecomputeResultDto {
}
exports.GroupRecomputeResultDto = GroupRecomputeResultDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], GroupRecomputeResultDto.prototype, "processedChildren", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], GroupRecomputeResultDto.prototype, "updatedGroups", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], GroupRecomputeResultDto.prototype, "archivedAdults", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], GroupRecomputeResultDto.prototype, "remindersCreated", void 0);
//# sourceMappingURL=groups.dto.js.map