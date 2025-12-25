"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const users_service_1 = require("./users.service");
const users_controller_1 = require("./users.controller");
const user_schema_1 = require("../schema/user.schema");
const monitor_profile_schema_1 = require("../schema/monitor-profile.schema");
const media_module_1 = require("../media/media.module");
const notifications_module_1 = require("../notifications/notifications.module");
const app_config_service_1 = require("../config/app-config.service");
let UsersModule = class UsersModule {
};
exports.UsersModule = UsersModule;
exports.UsersModule = UsersModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: user_schema_1.User.name, schema: user_schema_1.UserSchema },
                { name: monitor_profile_schema_1.MonitorProfile.name, schema: monitor_profile_schema_1.MonitorProfileSchema },
            ]),
            media_module_1.MediaModule,
            notifications_module_1.NotificationsModule,
        ],
        controllers: [users_controller_1.UsersController],
        providers: [users_service_1.UsersService, app_config_service_1.AppConfigService],
        exports: [users_service_1.UsersService],
    })
], UsersModule);
//# sourceMappingURL=users.module.js.map