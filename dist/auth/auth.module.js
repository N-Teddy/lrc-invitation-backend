"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const jwt_1 = require("@nestjs/jwt");
const users_module_1 = require("../users/users.module");
const auth_guard_1 = require("./guards/auth.guard");
const roles_guard_1 = require("./guards/roles.guard");
const auth_controller_1 = require("./auth.controller");
const auth_service_1 = require("./auth.service");
const notifications_module_1 = require("../notifications/notifications.module");
const google_service_1 = require("../common/third-party/google.service");
const app_config_service_1 = require("../config/app-config.service");
let AuthModule = class AuthModule {
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = __decorate([
    (0, common_1.Module)({
        imports: [
            users_module_1.UsersModule,
            notifications_module_1.NotificationsModule,
            jwt_1.JwtModule.register({
                global: true,
            }),
        ],
        providers: [
            {
                provide: core_1.APP_GUARD,
                useClass: auth_guard_1.AuthGuard,
            },
            {
                provide: core_1.APP_GUARD,
                useClass: roles_guard_1.RolesGuard,
            },
            core_1.Reflector,
            auth_service_1.AuthService,
            google_service_1.GoogleService,
            app_config_service_1.AppConfigService,
        ],
        controllers: [auth_controller_1.AuthController],
    })
], AuthModule);
//# sourceMappingURL=auth.module.js.map