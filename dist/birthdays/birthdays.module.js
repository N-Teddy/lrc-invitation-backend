"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BirthdaysModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const birthdays_service_1 = require("./birthdays.service");
const user_schema_1 = require("../schema/user.schema");
const monitor_profile_schema_1 = require("../schema/monitor-profile.schema");
const notifications_module_1 = require("../notifications/notifications.module");
const jobs_module_1 = require("../jobs/jobs.module");
const birthdays_cron_1 = require("../common/cron/birthdays.cron");
const recipients_resolver_service_1 = require("../common/services/recipients-resolver.service");
const app_config_service_1 = require("../config/app-config.service");
let BirthdaysModule = class BirthdaysModule {
};
exports.BirthdaysModule = BirthdaysModule;
exports.BirthdaysModule = BirthdaysModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: user_schema_1.User.name, schema: user_schema_1.UserSchema },
                { name: monitor_profile_schema_1.MonitorProfile.name, schema: monitor_profile_schema_1.MonitorProfileSchema },
            ]),
            notifications_module_1.NotificationsModule,
            jobs_module_1.JobsModule,
        ],
        providers: [birthdays_service_1.BirthdaysService, birthdays_cron_1.BirthdaysCron, recipients_resolver_service_1.RecipientsResolverService, app_config_service_1.AppConfigService],
    })
], BirthdaysModule);
//# sourceMappingURL=birthdays.module.js.map