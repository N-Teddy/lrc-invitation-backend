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
exports.ActionTokensService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const app_config_service_1 = require("../../config/app-config.service");
let ActionTokensService = class ActionTokensService {
    constructor(jwtService, config) {
        this.jwtService = jwtService;
        this.config = config;
    }
    sign(payload, expiresAt) {
        const ttlSeconds = Math.max(1, Math.floor((expiresAt.getTime() - Date.now()) / 1000));
        return this.jwtService.sign(payload, {
            secret: this.config.actionTokenSecret,
            expiresIn: ttlSeconds,
        });
    }
    async verify(token) {
        return (await this.jwtService.verifyAsync(token, {
            secret: this.config.actionTokenSecret,
        }));
    }
};
exports.ActionTokensService = ActionTokensService;
exports.ActionTokensService = ActionTokensService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        app_config_service_1.AppConfigService])
], ActionTokensService);
//# sourceMappingURL=action-tokens.service.js.map