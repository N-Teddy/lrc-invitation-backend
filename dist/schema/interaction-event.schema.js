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
exports.InteractionEventSchema = exports.InteractionEvent = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const notification_enum_1 = require("../common/enums/notification.enum");
let InteractionEvent = class InteractionEvent {
};
exports.InteractionEvent = InteractionEvent;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], InteractionEvent.prototype, "userId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Notification' }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], InteractionEvent.prototype, "notificationId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: notification_enum_1.NotificationContextType, required: true }),
    __metadata("design:type", String)
], InteractionEvent.prototype, "contextType", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: true }),
    __metadata("design:type", String)
], InteractionEvent.prototype, "contextId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], InteractionEvent.prototype, "actionId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object }),
    __metadata("design:type", Object)
], InteractionEvent.prototype, "meta", void 0);
exports.InteractionEvent = InteractionEvent = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], InteractionEvent);
exports.InteractionEventSchema = mongoose_1.SchemaFactory.createForClass(InteractionEvent);
exports.InteractionEventSchema.index({ userId: 1, createdAt: -1 });
exports.InteractionEventSchema.index({ contextType: 1, contextId: 1, createdAt: -1 });
//# sourceMappingURL=interaction-event.schema.js.map