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
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const user_enum_1 = require("../common/enums/user.enum");
const user_dto_1 = require("../dtos/request/user.dto");
const users_service_1 = require("./users.service");
const swagger_2 = require("@nestjs/swagger");
const user_dto_2 = require("../dtos/response/user.dto");
const platform_express_1 = require("@nestjs/platform-express");
const common_2 = require("@nestjs/common");
const media_service_1 = require("../media/media.service");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const notifications_service_1 = require("../notifications/notifications.service");
const notification_enum_1 = require("../common/enums/notification.enum");
const app_config_service_1 = require("../config/app-config.service");
const user_approval_dto_1 = require("../dtos/response/user-approval.dto");
let UsersController = class UsersController {
    constructor(usersService, mediaService, notificationService, config) {
        this.usersService = usersService;
        this.mediaService = mediaService;
        this.notificationService = notificationService;
        this.config = config;
    }
    create(dto) {
        return this.usersService.create(dto);
    }
    findAll() {
        return this.usersService.findAll();
    }
    findOne(id) {
        return this.usersService.findOneOrFail(id);
    }
    update(id, dto) {
        return this.usersService.update(id, dto);
    }
    updateMe(dto, currentUser) {
        return this.usersService.updateMyPreferences(currentUser, dto);
    }
    async approve(id, currentUser) {
        await this.usersService.assertCanApproveMonitorRegistration(currentUser, id);
        const { user, magicToken } = await this.usersService.approveMonitorRegistration(id);
        const to = user.email;
        const magicLinkSent = !!(to && magicToken);
        if (magicLinkSent) {
            const magicLinkUrl = `${this.config.frontendBaseUrl}/auth/magic?token=${magicToken}`;
            await this.notificationService.send({
                userId: user.id,
                to,
                subject: 'Your account is approved',
                message: `Hello ${user.fullName},\n\nYour account has been approved. Use this link to sign in: ${magicLinkUrl}\nThis link expires in 30 minutes.`,
                templateName: 'magic-link',
                templateData: {
                    fullName: user.fullName,
                    frontendBaseUrl: this.config.frontendBaseUrl,
                    token: magicToken,
                    magicLink: magicLinkUrl,
                    expiresInMinutes: 30,
                },
                contextType: notification_enum_1.NotificationContextType.Reminder,
                contextId: user.id,
            });
        }
        return { approved: true, magicLinkSent, user };
    }
    async uploadProfileImage(id, file, currentUser) {
        if (!file) {
            throw new common_2.BadRequestException('No file uploaded');
        }
        const isSelf = String(currentUser?.id ?? currentUser?._id) === id;
        const isSuper = currentUser?.monitorLevel === user_enum_1.MonitorLevel.Super;
        if (!isSelf && !isSuper) {
            throw new common_2.ForbiddenException('Not allowed');
        }
        const profileImage = await this.mediaService.uploadProfileImage(file);
        return this.usersService.updateProfileImage(id, profileImage);
    }
    remove(id) {
        return this.usersService.remove(id);
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, roles_decorator_1.Roles)([user_enum_1.UserRole.Monitor], [user_enum_1.MonitorLevel.Super]),
    (0, common_1.Post)(),
    (0, swagger_2.ApiCreatedResponse)({ type: user_dto_2.UserResponseDto }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_dto_1.CreateUserDto]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "create", null);
__decorate([
    (0, roles_decorator_1.Roles)([user_enum_1.UserRole.Monitor], [user_enum_1.MonitorLevel.Super]),
    (0, common_1.Get)(),
    (0, swagger_2.ApiOkResponse)({ type: [user_dto_2.UserResponseDto] }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "findAll", null);
__decorate([
    (0, roles_decorator_1.Roles)([user_enum_1.UserRole.Monitor], [user_enum_1.MonitorLevel.Super]),
    (0, common_1.Get)(':id'),
    (0, swagger_2.ApiOkResponse)({ type: user_dto_2.UserResponseDto }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "findOne", null);
__decorate([
    (0, roles_decorator_1.Roles)([user_enum_1.UserRole.Monitor], [user_enum_1.MonitorLevel.Super]),
    (0, common_1.Patch)(':id'),
    (0, swagger_2.ApiOkResponse)({ type: user_dto_2.UserResponseDto }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_dto_1.UpdateUserDto]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "update", null);
__decorate([
    (0, roles_decorator_1.Roles)([user_enum_1.UserRole.Monitor]),
    (0, common_1.Patch)('me'),
    (0, swagger_2.ApiOkResponse)({ type: user_dto_2.UserResponseDto }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_dto_1.UpdateMyPreferencesDto, Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "updateMe", null);
__decorate([
    (0, roles_decorator_1.Roles)([user_enum_1.UserRole.Monitor], [user_enum_1.MonitorLevel.Super]),
    (0, common_1.Post)(':id/approve'),
    (0, swagger_2.ApiOkResponse)({ type: user_approval_dto_1.ApproveUserResponseDto }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "approve", null);
__decorate([
    (0, roles_decorator_1.Roles)([user_enum_1.UserRole.Monitor]),
    (0, common_1.Post)(':id/profile-image'),
    (0, common_2.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        limits: { fileSize: 2 * 1024 * 1024 },
    })),
    (0, swagger_2.ApiConsumes)('multipart/form-data'),
    (0, swagger_2.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                file: { type: 'string', format: 'binary' },
            },
            required: ['file'],
        },
    }),
    (0, swagger_2.ApiOkResponse)({ type: user_dto_2.UserResponseDto }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_2.UploadedFile)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "uploadProfileImage", null);
__decorate([
    (0, roles_decorator_1.Roles)([user_enum_1.UserRole.Monitor], [user_enum_1.MonitorLevel.Super]),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "remove", null);
exports.UsersController = UsersController = __decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiTags)('users'),
    (0, common_1.Controller)('users'),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        media_service_1.MediaService,
        notifications_service_1.NotificationService,
        app_config_service_1.AppConfigService])
], UsersController);
//# sourceMappingURL=users.controller.js.map