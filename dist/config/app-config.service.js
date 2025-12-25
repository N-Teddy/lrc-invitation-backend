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
exports.AppConfigService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let AppConfigService = class AppConfigService {
    constructor(configService) {
        this.configService = configService;
    }
    get raw() {
        return this.configService;
    }
    get jwtAccessSecret() {
        return this.configService.get('JWT_ACCESS_SECRET', '');
    }
    get jwtRefreshSecret() {
        return this.configService.get('JWT_REFRESH_SECRET', '');
    }
    get actionTokenSecret() {
        return this.configService.get('ACTION_TOKEN_SECRET', '') || this.jwtRefreshSecret;
    }
    get googleClientId() {
        return this.configService.get('GOOGLE_CLIENT_ID');
    }
    get googleClientSecret() {
        return this.configService.get('GOOGLE_CLIENT_SECRET');
    }
    get appBaseUrl() {
        return this.configService.get('APP_BASE_URL', 'http://localhost:3000');
    }
    get frontendBaseUrl() {
        const configured = this.configService.get('FRONTEND_BASE_URL');
        const base = configured ?? 'http://localhost:5173';
        return base.replace(/\/$/, '');
    }
    get apiBaseUrl() {
        const configured = this.configService.get('API_BASE_URL');
        if (configured)
            return configured.replace(/\/$/, '');
        return `${this.appBaseUrl.replace(/\/$/, '')}/api`;
    }
    get storageProvider() {
        const env = this.configService.get('NODE_ENV', 'development');
        const configured = this.configService.get('STORAGE_PROVIDER');
        if (configured === 'local' || configured === 'cloudinary') {
            return configured;
        }
        return env === 'production' ? 'cloudinary' : 'local';
    }
    get storageBaseUrl() {
        return this.configService.get('STORAGE_BASE_URL', 'http://localhost:3000/uploads');
    }
    get uploadsDir() {
        return this.configService.get('UPLOADS_DIR', 'uploads');
    }
    get cloudinaryCloudName() {
        return this.configService.get('CLOUDINARY_CLOUD_NAME');
    }
    get cloudinaryApiKey() {
        return this.configService.get('CLOUDINARY_API_KEY');
    }
    get cloudinaryApiSecret() {
        return this.configService.get('CLOUDINARY_API_SECRET');
    }
    get notificationProvider() {
        return this.configService.get('NOTIFICATION_PROVIDER', 'email');
    }
    get notificationFallbackProvider() {
        return this.configService.get('NOTIFICATION_FALLBACK_PROVIDER', 'email');
    }
    get whatsAppEnabled() {
        return this.configService.get('WHATSAPP_ENABLED', 'false') === 'true';
    }
    get whatsAppPhoneNumberId() {
        return this.configService.get('WHATSAPP_PHONE_NUMBER_ID');
    }
    get whatsAppBusinessAccountId() {
        return this.configService.get('WHATSAPP_BUSINESS_ACCOUNT_ID');
    }
    get whatsAppAccessToken() {
        return this.configService.get('WHATSAPP_ACCESS_TOKEN');
    }
    get inAppNotificationsEnabled() {
        return this.configService.get('IN_APP_NOTIFICATIONS_ENABLED', 'true') === 'true';
    }
    get mailHost() {
        return this.configService.get('MAIL_HOST', 'localhost');
    }
    get mailPort() {
        return Number(this.configService.get('MAIL_PORT', 1025));
    }
    get mailUser() {
        return this.configService.get('MAIL_USER');
    }
    get mailPass() {
        return this.configService.get('MAIL_PASS');
    }
    get mailFrom() {
        return this.configService.get('MAIL_FROM', 'LRC Jeunesse <no-reply@lrc-jeunesse.local>');
    }
};
exports.AppConfigService = AppConfigService;
exports.AppConfigService = AppConfigService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], AppConfigService);
//# sourceMappingURL=app-config.service.js.map