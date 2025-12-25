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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChildrenController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const platform_express_1 = require("@nestjs/platform-express");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const user_enum_1 = require("../common/enums/user.enum");
const child_dto_1 = require("../dtos/request/child.dto");
const child_dto_2 = require("../dtos/response/child.dto");
const child_stats_dto_1 = require("../dtos/response/child-stats.dto");
const children_service_1 = require("./children.service");
let ChildrenController = class ChildrenController {
    constructor(childrenService) {
        this.childrenService = childrenService;
    }
    list(q, includeArchived, page, limit, currentUser) {
        return this.childrenService.list({
            q,
            includeArchived: includeArchived === 'true',
            page: page ? Number(page) : undefined,
            limit: limit ? Number(limit) : undefined,
        }, currentUser);
    }
    get(id, currentUser) {
        return this.childrenService.get(id, currentUser);
    }
    stats(id, currentUser) {
        return this.childrenService.getStats(id, currentUser);
    }
    create(dto, file, currentUser) {
        return this.childrenService.create(dto, file, currentUser);
    }
    bulk(dto, currentUser) {
        return this.childrenService.bulkCreate(dto.children ?? [], currentUser);
    }
    uploadProfileImage(id, file, currentUser) {
        return this.childrenService.uploadProfileImage(id, file, currentUser);
    }
    archive(id, currentUser) {
        return this.childrenService.archive(id, currentUser);
    }
};
exports.ChildrenController = ChildrenController;
__decorate([
    (0, roles_decorator_1.Roles)([user_enum_1.UserRole.Monitor]),
    (0, common_1.Get)(),
    (0, swagger_1.ApiOkResponse)({ type: child_dto_2.ChildrenListResponseDto }),
    __param(0, (0, common_1.Query)('q')),
    __param(1, (0, common_1.Query)('includeArchived')),
    __param(2, (0, common_1.Query)('page')),
    __param(3, (0, common_1.Query)('limit')),
    __param(4, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, Object]),
    __metadata("design:returntype", void 0)
], ChildrenController.prototype, "list", null);
__decorate([
    (0, roles_decorator_1.Roles)([user_enum_1.UserRole.Monitor]),
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOkResponse)({ type: child_dto_2.ChildResponseDto }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ChildrenController.prototype, "get", null);
__decorate([
    (0, roles_decorator_1.Roles)([user_enum_1.UserRole.Monitor]),
    (0, common_1.Get)(':id/stats'),
    (0, swagger_1.ApiOkResponse)({ type: child_stats_dto_1.ChildStatsResponseDto }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ChildrenController.prototype, "stats", null);
__decorate([
    (0, roles_decorator_1.Roles)([user_enum_1.UserRole.Monitor], [user_enum_1.MonitorLevel.Official, user_enum_1.MonitorLevel.Super]),
    (0, common_1.Post)(),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        limits: { fileSize: 2 * 1024 * 1024 },
    })),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                fullName: { type: 'string' },
                dateOfBirth: { type: 'string', example: '2014-06-02' },
                guardiansJson: {
                    type: 'string',
                    example: '[{\"fullName\":\"Jane Doe\",\"phoneE164\":\"+237693087159\",\"relationship\":\"Mother\"}]',
                },
                preferredLanguage: { type: 'string', example: 'en' },
                whatsAppPhoneE164: { type: 'string', example: '+237693087159' },
                whatsAppOptIn: { type: 'boolean', example: true },
                file: { type: 'string', format: 'binary' },
            },
            required: ['fullName', 'dateOfBirth', 'guardiansJson'],
        },
    }),
    (0, swagger_1.ApiCreatedResponse)({ type: child_dto_2.ChildResponseDto }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [child_dto_1.CreateChildMultipartDto, Object, Object]),
    __metadata("design:returntype", void 0)
], ChildrenController.prototype, "create", null);
__decorate([
    (0, roles_decorator_1.Roles)([user_enum_1.UserRole.Monitor], [user_enum_1.MonitorLevel.Official, user_enum_1.MonitorLevel.Super]),
    (0, common_1.Post)('bulk'),
    (0, swagger_1.ApiCreatedResponse)({ type: child_dto_2.BulkCreateChildrenResponseDto }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [child_dto_1.BulkCreateChildrenDto, Object]),
    __metadata("design:returntype", void 0)
], ChildrenController.prototype, "bulk", null);
__decorate([
    (0, roles_decorator_1.Roles)([user_enum_1.UserRole.Monitor], [user_enum_1.MonitorLevel.Official, user_enum_1.MonitorLevel.Super]),
    (0, common_1.Post)(':id/profile-image'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        limits: { fileSize: 2 * 1024 * 1024 },
    })),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                file: { type: 'string', format: 'binary' },
            },
            required: ['file'],
        },
    }),
    (0, swagger_1.ApiOkResponse)({ type: child_dto_2.ChildResponseDto }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], ChildrenController.prototype, "uploadProfileImage", null);
__decorate([
    (0, roles_decorator_1.Roles)([user_enum_1.UserRole.Monitor], [user_enum_1.MonitorLevel.Official, user_enum_1.MonitorLevel.Super]),
    (0, common_1.Post)(':id/archive'),
    (0, swagger_1.ApiOkResponse)({ type: child_dto_2.ChildResponseDto }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ChildrenController.prototype, "archive", null);
exports.ChildrenController = ChildrenController = __decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiTags)('children'),
    (0, common_1.Controller)('children'),
    __metadata("design:paramtypes", [children_service_1.ChildrenService])
], ChildrenController);
//# sourceMappingURL=children.controller.js.map