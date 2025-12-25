"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemindersModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const reminders_controller_1 = require("./reminders.controller");
const reminders_service_1 = require("./reminders.service");
const reminder_schema_1 = require("../schema/reminder.schema");
const user_schema_1 = require("../schema/user.schema");
const monitor_profile_schema_1 = require("../schema/monitor-profile.schema");
const interaction_event_schema_1 = require("../schema/interaction-event.schema");
const notifications_module_1 = require("../notifications/notifications.module");
const app_config_service_1 = require("../config/app-config.service");
const reminders_cron_1 = require("../common/cron/reminders.cron");
const town_scope_service_1 = require("../common/services/town-scope.service");
let RemindersModule = class RemindersModule {
};
exports.RemindersModule = RemindersModule;
exports.RemindersModule = RemindersModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: reminder_schema_1.Reminder.name, schema: reminder_schema_1.ReminderSchema },
                { name: user_schema_1.User.name, schema: user_schema_1.UserSchema },
                { name: monitor_profile_schema_1.MonitorProfile.name, schema: monitor_profile_schema_1.MonitorProfileSchema },
                { name: interaction_event_schema_1.InteractionEvent.name, schema: interaction_event_schema_1.InteractionEventSchema },
            ]),
            notifications_module_1.NotificationsModule,
        ],
        controllers: [reminders_controller_1.RemindersController],
        providers: [reminders_service_1.RemindersService, reminders_cron_1.RemindersCron, app_config_service_1.AppConfigService, town_scope_service_1.TownScopeService],
        exports: [reminders_service_1.RemindersService],
    })
], RemindersModule);
//# sourceMappingURL=reminders.module.js.map