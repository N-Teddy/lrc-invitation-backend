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
exports.MediaService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const promises_1 = require("fs/promises");
const path_1 = require("path");
const app_config_service_1 = require("../config/app-config.service");
const cloudinary_service_1 = require("../common/third-party/cloudinary.service");
const settings_service_1 = require("../settings/settings.service");
let MediaService = class MediaService {
    constructor(config, cloudinaryService, settingsService) {
        this.config = config;
        this.cloudinaryService = cloudinaryService;
        this.settingsService = settingsService;
    }
    async uploadProfileImage(file) {
        const mediaSettings = await this.settingsService.getMediaStorageSettings();
        if (!file.mimetype?.startsWith('image/')) {
            throw new common_1.BadRequestException('Invalid file type');
        }
        if (mediaSettings.allowedMimeTypes?.length &&
            !mediaSettings.allowedMimeTypes.includes(file.mimetype)) {
            throw new common_1.BadRequestException('Invalid file type');
        }
        if (typeof mediaSettings.maxSizeBytes === 'number' &&
            mediaSettings.maxSizeBytes > 0 &&
            file.size > mediaSettings.maxSizeBytes) {
            throw new common_1.BadRequestException('File too large');
        }
        if (this.config.storageProvider === 'cloudinary') {
            return this.cloudinaryService.uploadImage(file);
        }
        return this.saveLocal(file);
    }
    async saveLocal(file) {
        const uploadsDir = (0, path_1.join)(process.cwd(), this.config.uploadsDir, 'profile-images');
        await (0, promises_1.mkdir)(uploadsDir, { recursive: true });
        const extension = this.getExtension(file);
        const filename = `${(0, crypto_1.randomUUID)()}${extension}`;
        const filepath = (0, path_1.join)(uploadsDir, filename);
        await (0, promises_1.writeFile)(filepath, file.buffer);
        const baseUrl = this.config.storageBaseUrl;
        return {
            url: `${baseUrl}/profile-images/${filename}`,
            provider: 'local',
            mimeType: file.mimetype,
            sizeBytes: file.size,
            updatedAt: new Date(),
        };
    }
    getExtension(file) {
        const fromName = (0, path_1.extname)(file.originalname ?? '');
        if (fromName)
            return fromName;
        const m = file.mimetype.split('/')[1] ?? 'jpg';
        return `.${m}`;
    }
};
exports.MediaService = MediaService;
exports.MediaService = MediaService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [app_config_service_1.AppConfigService,
        cloudinary_service_1.CloudinaryService,
        settings_service_1.SettingsService])
], MediaService);
//# sourceMappingURL=media.service.js.map