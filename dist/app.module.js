"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const mongoose_1 = require("@nestjs/mongoose");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const users_module_1 = require("./users/users.module");
const auth_module_1 = require("./auth/auth.module");
const notifications_module_1 = require("./notifications/notifications.module");
const media_module_1 = require("./media/media.module");
const groups_module_1 = require("./groups/groups.module");
const activities_module_1 = require("./activities/activities.module");
const attendance_module_1 = require("./attendance/attendance.module");
const reporting_module_1 = require("./reporting/reporting.module");
const payments_module_1 = require("./payments/payments.module");
const reminders_module_1 = require("./reminders/reminders.module");
const settings_module_1 = require("./settings/settings.module");
const birthdays_module_1 = require("./birthdays/birthdays.module");
const actions_module_1 = require("./actions/actions.module");
const conversations_module_1 = require("./conversations/conversations.module");
const interactions_module_1 = require("./interactions/interactions.module");
const children_module_1 = require("./children/children.module");
const directory_module_1 = require("./directory/directory.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
            }),
            mongoose_1.MongooseModule.forRootAsync({
                useFactory: (configService) => ({
                    uri: configService.get('MONGODB_URI') ??
                        'mongodb://localhost:27017/lrc-jeuness',
                }),
                inject: [config_1.ConfigService],
            }),
            users_module_1.UsersModule,
            auth_module_1.AuthModule,
            notifications_module_1.NotificationsModule,
            settings_module_1.SettingsModule,
            media_module_1.MediaModule,
            groups_module_1.GroupsModule,
            activities_module_1.ActivitiesModule,
            attendance_module_1.AttendanceModule,
            reporting_module_1.ReportingModule,
            payments_module_1.PaymentsModule,
            reminders_module_1.RemindersModule,
            birthdays_module_1.BirthdaysModule,
            children_module_1.ChildrenModule,
            directory_module_1.DirectoryModule,
            conversations_module_1.ConversationsModule,
            actions_module_1.ActionsModule,
            interactions_module_1.InteractionsModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map