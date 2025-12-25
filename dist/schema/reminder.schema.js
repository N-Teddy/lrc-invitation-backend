"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReminderSchema = exports.Reminder = exports.ReminderScheduleType = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const notification_enum_1 = require("../common/enums/notification.enum");
var ReminderScheduleType;
(function (ReminderScheduleType) {
    ReminderScheduleType["Once"] = "once";
    ReminderScheduleType["IntervalMinutes"] = "interval_minutes";
    ReminderScheduleType["Daily"] = "daily";
    ReminderScheduleType["Weekly"] = "weekly";
    ReminderScheduleType["Monthly"] = "monthly";
})(ReminderScheduleType || (exports.ReminderScheduleType = ReminderScheduleType = {}));
let ExpectedResponse = class ExpectedResponse {
};
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], ExpectedResponse.prototype, "label", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], ExpectedResponse.prototype, "value", void 0);
ExpectedResponse = __decorate([
    (0, mongoose_1.Schema)({ _id: false })
], ExpectedResponse);
let ReminderSchedule = class ReminderSchedule {
};
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: ReminderScheduleType }),
    __metadata("design:type", String)
], ReminderSchedule.prototype, "type", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], ReminderSchedule.prototype, "runAt", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Number)
], ReminderSchedule.prototype, "intervalMinutes", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Number)
], ReminderSchedule.prototype, "hour", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Number)
], ReminderSchedule.prototype, "minute", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Number)
], ReminderSchedule.prototype, "dayOfWeek", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Number)
], ReminderSchedule.prototype, "dayOfMonth", void 0);
ReminderSchedule = __decorate([
    (0, mongoose_1.Schema)({ _id: false })
], ReminderSchedule);
let Reminder = class Reminder {
};
exports.Reminder = Reminder;
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: notification_enum_1.ReminderKind, default: notification_enum_1.ReminderKind.Custom }),
    __metadata("design:type", String)
], Reminder.prototype, "kind", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User' }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Reminder.prototype, "createdByUserId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Reminder.prototype, "message", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: notification_enum_1.Channel, default: notification_enum_1.Channel.WhatsApp }),
    __metadata("design:type", String)
], Reminder.prototype, "channel", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: ReminderSchedule }),
    __metadata("design:type", ReminderSchedule)
], Reminder.prototype, "schedule", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], Reminder.prototype, "nextRunAt", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], Reminder.prototype, "lastSentAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], Reminder.prototype, "awaitingAckUserIds", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], Reminder.prototype, "acknowledgedByUserIds", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], Reminder.prototype, "recipients", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [ExpectedResponse], default: [] }),
    __metadata("design:type", Array)
], Reminder.prototype, "expectedResponses", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: notification_enum_1.ReminderStatus, default: notification_enum_1.ReminderStatus.Draft }),
    __metadata("design:type", String)
], Reminder.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object }),
    __metadata("design:type", Object)
], Reminder.prototype, "context", void 0);
exports.Reminder = Reminder = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Reminder);
exports.ReminderSchema = mongoose_1.SchemaFactory.createForClass(Reminder);
exports.ReminderSchema.index({ status: 1 });
exports.ReminderSchema.index({ status: 1, nextRunAt: 1 });
//# sourceMappingURL=reminder.schema.js.map