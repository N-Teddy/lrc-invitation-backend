"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportingModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const reporting_controller_1 = require("./reporting.controller");
const reporting_service_1 = require("./reporting.service");
const activity_schema_1 = require("../schema/activity.schema");
const attendance_schema_1 = require("../schema/attendance.schema");
const user_schema_1 = require("../schema/user.schema");
const notifications_module_1 = require("../notifications/notifications.module");
const monitor_profile_schema_1 = require("../schema/monitor-profile.schema");
const town_scope_service_1 = require("../common/services/town-scope.service");
const jobs_module_1 = require("../jobs/jobs.module");
const recipients_resolver_service_1 = require("../common/services/recipients-resolver.service");
const transitions_cron_1 = require("../common/cron/transitions.cron");
const app_config_service_1 = require("../config/app-config.service");
let ReportingModule = class ReportingModule {
};
exports.ReportingModule = ReportingModule;
exports.ReportingModule = ReportingModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: activity_schema_1.Activity.name, schema: activity_schema_1.ActivitySchema },
                { name: attendance_schema_1.Attendance.name, schema: attendance_schema_1.AttendanceSchema },
                { name: user_schema_1.User.name, schema: user_schema_1.UserSchema },
                { name: monitor_profile_schema_1.MonitorProfile.name, schema: monitor_profile_schema_1.MonitorProfileSchema },
            ]),
            notifications_module_1.NotificationsModule,
            jobs_module_1.JobsModule,
        ],
        controllers: [reporting_controller_1.ReportingController],
        providers: [
            reporting_service_1.ReportingService,
            town_scope_service_1.TownScopeService,
            recipients_resolver_service_1.RecipientsResolverService,
            transitions_cron_1.TransitionsCron,
            app_config_service_1.AppConfigService,
        ],
        exports: [reporting_service_1.ReportingService],
    })
], ReportingModule);
//# sourceMappingURL=reporting.module.js.map