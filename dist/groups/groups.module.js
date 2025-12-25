"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GroupsModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const groups_service_1 = require("./groups.service");
const groups_controller_1 = require("./groups.controller");
const user_schema_1 = require("../schema/user.schema");
const child_profile_schema_1 = require("../schema/child-profile.schema");
const monitor_profile_schema_1 = require("../schema/monitor-profile.schema");
const reminder_schema_1 = require("../schema/reminder.schema");
const notifications_module_1 = require("../notifications/notifications.module");
const app_config_service_1 = require("../config/app-config.service");
const groups_cron_1 = require("../common/cron/groups.cron");
const recipients_resolver_service_1 = require("../common/services/recipients-resolver.service");
let GroupsModule = class GroupsModule {
};
exports.GroupsModule = GroupsModule;
exports.GroupsModule = GroupsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: user_schema_1.User.name, schema: user_schema_1.UserSchema },
                { name: child_profile_schema_1.ChildProfile.name, schema: child_profile_schema_1.ChildProfileSchema },
                { name: monitor_profile_schema_1.MonitorProfile.name, schema: monitor_profile_schema_1.MonitorProfileSchema },
                { name: reminder_schema_1.Reminder.name, schema: reminder_schema_1.ReminderSchema },
            ]),
            notifications_module_1.NotificationsModule,
        ],
        providers: [groups_service_1.GroupsService, groups_cron_1.GroupsCron, app_config_service_1.AppConfigService, recipients_resolver_service_1.RecipientsResolverService],
        controllers: [groups_controller_1.GroupsController],
        exports: [groups_service_1.GroupsService],
    })
], GroupsModule);
//# sourceMappingURL=groups.module.js.map