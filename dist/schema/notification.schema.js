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
exports.NotificationSchema = exports.Notification = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const notification_enum_1 = require("../common/enums/notification.enum");
let InteractiveOption = class InteractiveOption {
};
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], InteractiveOption.prototype, "id", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], InteractiveOption.prototype, "label", void 0);
InteractiveOption = __decorate([
    (0, mongoose_1.Schema)({ _id: false })
], InteractiveOption);
let Notification = class Notification {
};
exports.Notification = Notification;
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: notification_enum_1.Channel, default: notification_enum_1.Channel.Email }),
    __metadata("design:type", String)
], Notification.prototype, "primaryChannel", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: notification_enum_1.Channel, default: notification_enum_1.Channel.Email }),
    __metadata("design:type", String)
], Notification.prototype, "channelUsed", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], Notification.prototype, "fallbackUsed", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Notification.prototype, "skipReason", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Notification.prototype, "toUserId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: notification_enum_1.NotificationContextType, required: true }),
    __metadata("design:type", String)
], Notification.prototype, "contextType", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: true }),
    __metadata("design:type", String)
], Notification.prototype, "contextId", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Notification.prototype, "templateName", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Notification.prototype, "templateLanguage", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Notification.prototype, "languageUsed", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], Notification.prototype, "languageFallbackUsed", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [InteractiveOption], default: [] }),
    __metadata("design:type", Array)
], Notification.prototype, "interactiveOptions", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: notification_enum_1.NotificationStatus, default: notification_enum_1.NotificationStatus.Queued }),
    __metadata("design:type", String)
], Notification.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object }),
    __metadata("design:type", Object)
], Notification.prototype, "payload", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], Notification.prototype, "attempts", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 6 }),
    __metadata("design:type", Number)
], Notification.prototype, "maxAttempts", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], Notification.prototype, "nextAttemptAt", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], Notification.prototype, "lastAttemptAt", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Notification.prototype, "providerMessageId", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Notification.prototype, "error", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], Notification.prototype, "sentAt", void 0);
exports.Notification = Notification = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Notification);
exports.NotificationSchema = mongoose_1.SchemaFactory.createForClass(Notification);
exports.NotificationSchema.index({ toUserId: 1, createdAt: 1 });
exports.NotificationSchema.index({ contextType: 1, contextId: 1 });
exports.NotificationSchema.index({ status: 1 });
exports.NotificationSchema.index({ status: 1, nextAttemptAt: 1 });
//# sourceMappingURL=notification.schema.js.map