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
exports.GroupsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const user_enum_1 = require("../common/enums/user.enum");
const groups_dto_1 = require("../dtos/response/groups.dto");
const groups_service_1 = require("./groups.service");
let GroupsController = class GroupsController {
    constructor(groupsService) {
        this.groupsService = groupsService;
    }
    async getMapping() {
        return this.groupsService.getAgeToGroupMapping();
    }
    async recompute() {
        return this.groupsService.recomputeAllChildren();
    }
};
exports.GroupsController = GroupsController;
__decorate([
    (0, roles_decorator_1.Roles)([user_enum_1.UserRole.Monitor], [user_enum_1.MonitorLevel.Super]),
    (0, common_1.Get)('mapping'),
    (0, swagger_1.ApiOkResponse)({ type: groups_dto_1.AgeToGroupMappingResponseDto }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], GroupsController.prototype, "getMapping", null);
__decorate([
    (0, roles_decorator_1.Roles)([user_enum_1.UserRole.Monitor], [user_enum_1.MonitorLevel.Super]),
    (0, common_1.Post)('recompute'),
    (0, swagger_1.ApiOkResponse)({ type: groups_dto_1.GroupRecomputeResultDto }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], GroupsController.prototype, "recompute", null);
exports.GroupsController = GroupsController = __decorate([
    (0, swagger_1.ApiTags)('groups'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('groups'),
    __metadata("design:paramtypes", [groups_service_1.GroupsService])
], GroupsController);
//# sourceMappingURL=groups.controller.js.map