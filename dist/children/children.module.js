"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChildrenModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const children_controller_1 = require("./children.controller");
const children_service_1 = require("./children.service");
const user_schema_1 = require("../schema/user.schema");
const child_profile_schema_1 = require("../schema/child-profile.schema");
const monitor_profile_schema_1 = require("../schema/monitor-profile.schema");
const attendance_schema_1 = require("../schema/attendance.schema");
const activity_schema_1 = require("../schema/activity.schema");
const town_scope_service_1 = require("../common/services/town-scope.service");
const settings_module_1 = require("../settings/settings.module");
const media_module_1 = require("../media/media.module");
const notifications_module_1 = require("../notifications/notifications.module");
const users_module_1 = require("../users/users.module");
const app_config_service_1 = require("../config/app-config.service");
let ChildrenModule = class ChildrenModule {
};
exports.ChildrenModule = ChildrenModule;
exports.ChildrenModule = ChildrenModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: user_schema_1.User.name, schema: user_schema_1.UserSchema },
                { name: child_profile_schema_1.ChildProfile.name, schema: child_profile_schema_1.ChildProfileSchema },
                { name: monitor_profile_schema_1.MonitorProfile.name, schema: monitor_profile_schema_1.MonitorProfileSchema },
                { name: attendance_schema_1.Attendance.name, schema: attendance_schema_1.AttendanceSchema },
                { name: activity_schema_1.Activity.name, schema: activity_schema_1.ActivitySchema },
            ]),
            settings_module_1.SettingsModule,
            media_module_1.MediaModule,
            notifications_module_1.NotificationsModule,
            users_module_1.UsersModule,
        ],
        controllers: [children_controller_1.ChildrenController],
        providers: [children_service_1.ChildrenService, town_scope_service_1.TownScopeService, app_config_service_1.AppConfigService],
        exports: [children_service_1.ChildrenService],
    })
], ChildrenModule);
//# sourceMappingURL=children.module.js.map