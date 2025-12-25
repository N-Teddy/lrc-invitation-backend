"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActionsModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const app_config_service_1 = require("../config/app-config.service");
const action_tokens_service_1 = require("../common/services/action-tokens.service");
const conversations_module_1 = require("../conversations/conversations.module");
const actions_controller_1 = require("./actions.controller");
const actions_service_1 = require("./actions.service");
const notification_schema_1 = require("../schema/notification.schema");
const user_schema_1 = require("../schema/user.schema");
const reminder_schema_1 = require("../schema/reminder.schema");
const interaction_event_schema_1 = require("../schema/interaction-event.schema");
let ActionsModule = class ActionsModule {
};
exports.ActionsModule = ActionsModule;
exports.ActionsModule = ActionsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: notification_schema_1.Notification.name, schema: notification_schema_1.NotificationSchema },
                { name: user_schema_1.User.name, schema: user_schema_1.UserSchema },
                { name: reminder_schema_1.Reminder.name, schema: reminder_schema_1.ReminderSchema },
                { name: interaction_event_schema_1.InteractionEvent.name, schema: interaction_event_schema_1.InteractionEventSchema },
            ]),
            conversations_module_1.ConversationsModule,
        ],
        controllers: [actions_controller_1.ActionsController],
        providers: [actions_service_1.ActionsService, action_tokens_service_1.ActionTokensService, app_config_service_1.AppConfigService],
    })
], ActionsModule);
//# sourceMappingURL=actions.module.js.map