"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InteractionsModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const interactions_controller_1 = require("./interactions.controller");
const interactions_service_1 = require("./interactions.service");
const interaction_event_schema_1 = require("../schema/interaction-event.schema");
const user_schema_1 = require("../schema/user.schema");
const reminder_schema_1 = require("../schema/reminder.schema");
const activity_schema_1 = require("../schema/activity.schema");
let InteractionsModule = class InteractionsModule {
};
exports.InteractionsModule = InteractionsModule;
exports.InteractionsModule = InteractionsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: interaction_event_schema_1.InteractionEvent.name, schema: interaction_event_schema_1.InteractionEventSchema },
                { name: user_schema_1.User.name, schema: user_schema_1.UserSchema },
                { name: reminder_schema_1.Reminder.name, schema: reminder_schema_1.ReminderSchema },
                { name: activity_schema_1.Activity.name, schema: activity_schema_1.ActivitySchema },
            ]),
        ],
        controllers: [interactions_controller_1.InteractionsController],
        providers: [interactions_service_1.InteractionsService],
    })
], InteractionsModule);
//# sourceMappingURL=interactions.module.js.map