"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const notification_schema_1 = require("../schema/notification.schema");
const notifications_service_1 = require("./notifications.service");
const email_sender_1 = require("./email.sender");
const whatsapp_stub_sender_1 = require("./whatsapp.stub.sender");
const notifications_gateway_1 = require("./notifications.gateway");
const app_config_service_1 = require("../config/app-config.service");
const user_schema_1 = require("../schema/user.schema");
const notifications_cron_1 = require("../common/cron/notifications.cron");
const conversations_module_1 = require("../conversations/conversations.module");
const action_tokens_service_1 = require("../common/services/action-tokens.service");
let NotificationsModule = class NotificationsModule {
};
exports.NotificationsModule = NotificationsModule;
exports.NotificationsModule = NotificationsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: notification_schema_1.Notification.name, schema: notification_schema_1.NotificationSchema },
                { name: user_schema_1.User.name, schema: user_schema_1.UserSchema },
            ]),
            conversations_module_1.ConversationsModule,
        ],
        providers: [
            notifications_service_1.NotificationService,
            email_sender_1.EmailNotificationSender,
            whatsapp_stub_sender_1.WhatsAppNotificationSender,
            notifications_gateway_1.NotificationsGateway,
            app_config_service_1.AppConfigService,
            action_tokens_service_1.ActionTokensService,
            notifications_cron_1.NotificationsCron,
        ],
        exports: [notifications_service_1.NotificationService, notifications_gateway_1.NotificationsGateway],
    })
], NotificationsModule);
//# sourceMappingURL=notifications.module.js.map