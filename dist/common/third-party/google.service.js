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
exports.GoogleService = void 0;
const common_1 = require("@nestjs/common");
const google_auth_library_1 = require("google-auth-library");
const app_config_service_1 = require("../../config/app-config.service");
let GoogleService = class GoogleService {
    constructor(config) {
        this.config = config;
        this.client = new google_auth_library_1.OAuth2Client();
    }
    async verifyIdToken(idToken) {
        const audience = this.config.googleClientId;
        const ticket = await this.client.verifyIdToken({
            idToken,
            audience,
        });
        const payload = ticket.getPayload();
        if (!payload) {
            throw new common_1.UnauthorizedException('Invalid Google token');
        }
        return payload;
    }
};
exports.GoogleService = GoogleService;
exports.GoogleService = GoogleService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [app_config_service_1.AppConfigService])
], GoogleService);
//# sourceMappingURL=google.service.js.map