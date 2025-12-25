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
exports.RemindersController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const user_enum_1 = require("../common/enums/user.enum");
const reminder_dto_1 = require("../dtos/request/reminder.dto");
const reminder_dto_2 = require("../dtos/response/reminder.dto");
const reminders_service_1 = require("./reminders.service");
let RemindersController = class RemindersController {
    constructor(remindersService) {
        this.remindersService = remindersService;
    }
    create(dto, currentUser) {
        return this.remindersService.create(dto, currentUser);
    }
    async list(currentUser) {
        const items = await this.remindersService.list(currentUser);
        return { items };
    }
    findOne(id, currentUser) {
        return this.remindersService.findOneOrFail(id, currentUser);
    }
    update(id, dto, currentUser) {
        return this.remindersService.update(id, dto, currentUser);
    }
    activate(id, currentUser) {
        return this.remindersService.activate(id, currentUser);
    }
    pause(id, currentUser) {
        return this.remindersService.pause(id, currentUser);
    }
    end(id, currentUser) {
        return this.remindersService.end(id, currentUser);
    }
    acknowledge(id, currentUser) {
        return this.remindersService.acknowledge(id, currentUser);
    }
    respond(id, dto, currentUser) {
        return this.remindersService.respond(id, dto, currentUser);
    }
};
exports.RemindersController = RemindersController;
__decorate([
    (0, roles_decorator_1.Roles)([user_enum_1.UserRole.Monitor], [user_enum_1.MonitorLevel.Official, user_enum_1.MonitorLevel.Super]),
    (0, common_1.Post)(),
    (0, swagger_1.ApiCreatedResponse)({ type: reminder_dto_2.ReminderResponseDto }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [reminder_dto_1.CreateReminderDto, Object]),
    __metadata("design:returntype", void 0)
], RemindersController.prototype, "create", null);
__decorate([
    (0, roles_decorator_1.Roles)([user_enum_1.UserRole.Monitor]),
    (0, common_1.Get)(),
    (0, swagger_1.ApiOkResponse)({ type: reminder_dto_2.RemindersListResponseDto }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RemindersController.prototype, "list", null);
__decorate([
    (0, roles_decorator_1.Roles)([user_enum_1.UserRole.Monitor]),
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOkResponse)({ type: reminder_dto_2.ReminderResponseDto }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], RemindersController.prototype, "findOne", null);
__decorate([
    (0, roles_decorator_1.Roles)([user_enum_1.UserRole.Monitor], [user_enum_1.MonitorLevel.Official, user_enum_1.MonitorLevel.Super]),
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOkResponse)({ type: reminder_dto_2.ReminderResponseDto }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, reminder_dto_1.UpdateReminderDto, Object]),
    __metadata("design:returntype", void 0)
], RemindersController.prototype, "update", null);
__decorate([
    (0, roles_decorator_1.Roles)([user_enum_1.UserRole.Monitor], [user_enum_1.MonitorLevel.Official, user_enum_1.MonitorLevel.Super]),
    (0, common_1.Post)(':id/activate'),
    (0, swagger_1.ApiOkResponse)({ type: reminder_dto_2.ReminderResponseDto }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], RemindersController.prototype, "activate", null);
__decorate([
    (0, roles_decorator_1.Roles)([user_enum_1.UserRole.Monitor], [user_enum_1.MonitorLevel.Official, user_enum_1.MonitorLevel.Super]),
    (0, common_1.Post)(':id/pause'),
    (0, swagger_1.ApiOkResponse)({ type: reminder_dto_2.ReminderResponseDto }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], RemindersController.prototype, "pause", null);
__decorate([
    (0, roles_decorator_1.Roles)([user_enum_1.UserRole.Monitor], [user_enum_1.MonitorLevel.Official, user_enum_1.MonitorLevel.Super]),
    (0, common_1.Post)(':id/end'),
    (0, swagger_1.ApiOkResponse)({ type: reminder_dto_2.ReminderResponseDto }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], RemindersController.prototype, "end", null);
__decorate([
    (0, roles_decorator_1.Roles)([user_enum_1.UserRole.Monitor]),
    (0, common_1.Post)(':id/ack'),
    (0, swagger_1.ApiOkResponse)({ type: reminder_dto_2.ReminderResponseDto }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], RemindersController.prototype, "acknowledge", null);
__decorate([
    (0, roles_decorator_1.Roles)([user_enum_1.UserRole.Monitor]),
    (0, common_1.Post)(':id/respond'),
    (0, swagger_1.ApiOkResponse)({ type: reminder_dto_2.ReminderResponseDto }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, reminder_dto_1.RespondReminderDto, Object]),
    __metadata("design:returntype", void 0)
], RemindersController.prototype, "respond", null);
exports.RemindersController = RemindersController = __decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiTags)('reminders'),
    (0, common_1.Controller)('reminders'),
    __metadata("design:paramtypes", [reminders_service_1.RemindersService])
], RemindersController);
//# sourceMappingURL=reminders.controller.js.map