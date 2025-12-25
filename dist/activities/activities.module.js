"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActivitiesModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const activities_controller_1 = require("./activities.controller");
const activities_service_1 = require("./activities.service");
const activity_schema_1 = require("../schema/activity.schema");
const user_schema_1 = require("../schema/user.schema");
const child_profile_schema_1 = require("../schema/child-profile.schema");
const attendance_schema_1 = require("../schema/attendance.schema");
const monitor_profile_schema_1 = require("../schema/monitor-profile.schema");
const town_scope_service_1 = require("../common/services/town-scope.service");
const jobs_module_1 = require("../jobs/jobs.module");
const recipients_resolver_service_1 = require("../common/services/recipients-resolver.service");
const activities_invites_cron_1 = require("../common/cron/activities-invites.cron");
const activities_invites_service_1 = require("./activities-invites.service");
const notifications_module_1 = require("../notifications/notifications.module");
const app_config_service_1 = require("../config/app-config.service");
let ActivitiesModule = class ActivitiesModule {
};
exports.ActivitiesModule = ActivitiesModule;
exports.ActivitiesModule = ActivitiesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: activity_schema_1.Activity.name, schema: activity_schema_1.ActivitySchema },
                { name: user_schema_1.User.name, schema: user_schema_1.UserSchema },
                { name: child_profile_schema_1.ChildProfile.name, schema: child_profile_schema_1.ChildProfileSchema },
                { name: attendance_schema_1.Attendance.name, schema: attendance_schema_1.AttendanceSchema },
                { name: monitor_profile_schema_1.MonitorProfile.name, schema: monitor_profile_schema_1.MonitorProfileSchema },
            ]),
            jobs_module_1.JobsModule,
            notifications_module_1.NotificationsModule,
        ],
        controllers: [activities_controller_1.ActivitiesController],
        providers: [
            activities_service_1.ActivitiesService,
            activities_invites_service_1.ActivitiesInvitesService,
            activities_invites_cron_1.ActivitiesInvitesCron,
            town_scope_service_1.TownScopeService,
            recipients_resolver_service_1.RecipientsResolverService,
            app_config_service_1.AppConfigService,
        ],
        exports: [activities_service_1.ActivitiesService],
    })
], ActivitiesModule);
//# sourceMappingURL=activities.module.js.map