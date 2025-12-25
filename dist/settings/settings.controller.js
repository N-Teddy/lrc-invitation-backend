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
exports.SettingsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const user_enum_1 = require("../common/enums/user.enum");
const settings_dto_1 = require("../dtos/request/settings.dto");
const settings_dto_2 = require("../dtos/response/settings.dto");
const settings_service_1 = require("./settings.service");
let SettingsController = class SettingsController {
    constructor(settingsService) {
        this.settingsService = settingsService;
    }
    getAgeToGroupMapping() {
        return this.settingsService.getAgeToGroupMapping();
    }
    setAgeToGroupMapping(dto) {
        return this.settingsService.setAgeToGroupMapping(dto.bands);
    }
    getClassificationLabels() {
        return this.settingsService.getClassificationLabels();
    }
    setClassificationLabels(dto) {
        return this.settingsService.setClassificationLabels(dto.labels);
    }
    getLanguages() {
        return this.settingsService.getLanguages();
    }
    setLanguages(dto) {
        return this.settingsService.setLanguages(dto.supportedLanguages, dto.defaultLanguage);
    }
    getNotificationRecipients() {
        return this.settingsService.getNotificationRecipients();
    }
    setNotificationRecipients(dto) {
        return this.settingsService.setNotificationRecipients(dto.rules);
    }
    getMediaStorage() {
        return this.settingsService.getMediaStorageSettings();
    }
    setMediaStorage(dto) {
        return this.settingsService.setMediaStorageSettings(dto);
    }
};
exports.SettingsController = SettingsController;
__decorate([
    (0, roles_decorator_1.Roles)([user_enum_1.UserRole.Monitor]),
    (0, common_1.Get)('age-to-group-mapping'),
    (0, swagger_1.ApiOkResponse)({ type: settings_dto_2.AgeToGroupMappingResponseDto }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SettingsController.prototype, "getAgeToGroupMapping", null);
__decorate([
    (0, roles_decorator_1.Roles)([user_enum_1.UserRole.Monitor], [user_enum_1.MonitorLevel.Super]),
    (0, common_1.Put)('age-to-group-mapping'),
    (0, swagger_1.ApiOkResponse)({ type: settings_dto_2.AgeToGroupMappingResponseDto }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [settings_dto_1.SetAgeToGroupMappingRequestDto]),
    __metadata("design:returntype", void 0)
], SettingsController.prototype, "setAgeToGroupMapping", null);
__decorate([
    (0, roles_decorator_1.Roles)([user_enum_1.UserRole.Monitor]),
    (0, common_1.Get)('classification-labels'),
    (0, swagger_1.ApiOkResponse)({ type: settings_dto_2.ClassificationLabelsResponseDto }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SettingsController.prototype, "getClassificationLabels", null);
__decorate([
    (0, roles_decorator_1.Roles)([user_enum_1.UserRole.Monitor], [user_enum_1.MonitorLevel.Super]),
    (0, common_1.Put)('classification-labels'),
    (0, swagger_1.ApiOkResponse)({ type: settings_dto_2.ClassificationLabelsResponseDto }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [settings_dto_1.SetClassificationLabelsRequestDto]),
    __metadata("design:returntype", void 0)
], SettingsController.prototype, "setClassificationLabels", null);
__decorate([
    (0, roles_decorator_1.Roles)([user_enum_1.UserRole.Monitor]),
    (0, common_1.Get)('languages'),
    (0, swagger_1.ApiOkResponse)({ type: settings_dto_2.LanguagesResponseDto }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SettingsController.prototype, "getLanguages", null);
__decorate([
    (0, roles_decorator_1.Roles)([user_enum_1.UserRole.Monitor], [user_enum_1.MonitorLevel.Super]),
    (0, common_1.Put)('languages'),
    (0, swagger_1.ApiOkResponse)({ type: settings_dto_2.LanguagesResponseDto }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [settings_dto_1.SetLanguagesRequestDto]),
    __metadata("design:returntype", void 0)
], SettingsController.prototype, "setLanguages", null);
__decorate([
    (0, roles_decorator_1.Roles)([user_enum_1.UserRole.Monitor]),
    (0, common_1.Get)('notification-recipients'),
    (0, swagger_1.ApiOkResponse)({ type: settings_dto_2.NotificationRecipientsResponseDto }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SettingsController.prototype, "getNotificationRecipients", null);
__decorate([
    (0, roles_decorator_1.Roles)([user_enum_1.UserRole.Monitor], [user_enum_1.MonitorLevel.Super]),
    (0, common_1.Put)('notification-recipients'),
    (0, swagger_1.ApiOkResponse)({ type: settings_dto_2.NotificationRecipientsResponseDto }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [settings_dto_1.SetNotificationRecipientsRequestDto]),
    __metadata("design:returntype", void 0)
], SettingsController.prototype, "setNotificationRecipients", null);
__decorate([
    (0, roles_decorator_1.Roles)([user_enum_1.UserRole.Monitor]),
    (0, common_1.Get)('media-storage'),
    (0, swagger_1.ApiOkResponse)({ type: settings_dto_2.MediaStorageResponseDto }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SettingsController.prototype, "getMediaStorage", null);
__decorate([
    (0, roles_decorator_1.Roles)([user_enum_1.UserRole.Monitor], [user_enum_1.MonitorLevel.Super]),
    (0, common_1.Put)('media-storage'),
    (0, swagger_1.ApiOkResponse)({ type: settings_dto_2.MediaStorageResponseDto }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [settings_dto_1.SetMediaStorageRequestDto]),
    __metadata("design:returntype", void 0)
], SettingsController.prototype, "setMediaStorage", null);
exports.SettingsController = SettingsController = __decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiTags)('settings'),
    (0, common_1.Controller)('settings'),
    __metadata("design:paramtypes", [settings_service_1.SettingsService])
], SettingsController);
//# sourceMappingURL=settings.controller.js.map