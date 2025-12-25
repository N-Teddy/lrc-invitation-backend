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
exports.MonitorDirectoryResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const user_enum_1 = require("../../common/enums/user.enum");
const activity_enum_1 = require("../../common/enums/activity.enum");
class MonitorDirectoryResponseDto {
}
exports.MonitorDirectoryResponseDto = MonitorDirectoryResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], MonitorDirectoryResponseDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], MonitorDirectoryResponseDto.prototype, "fullName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: activity_enum_1.Town }),
    __metadata("design:type", String)
], MonitorDirectoryResponseDto.prototype, "originTown", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: user_enum_1.MonitorLevel }),
    __metadata("design:type", String)
], MonitorDirectoryResponseDto.prototype, "monitorLevel", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], MonitorDirectoryResponseDto.prototype, "profileImageUrl", void 0);
//# sourceMappingURL=directory.dto.js.map