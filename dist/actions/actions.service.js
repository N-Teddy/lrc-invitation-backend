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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActionsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const action_tokens_service_1 = require("../common/services/action-tokens.service");
const conversation_state_service_1 = require("../conversations/conversation-state.service");
const notification_schema_1 = require("../schema/notification.schema");
const user_schema_1 = require("../schema/user.schema");
const interaction_event_schema_1 = require("../schema/interaction-event.schema");
const notification_enum_1 = require("../common/enums/notification.enum");
const user_enum_1 = require("../common/enums/user.enum");
const reminder_schema_1 = require("../schema/reminder.schema");
const recurrence_util_1 = require("../common/utils/recurrence.util");
const notification_enum_2 = require("../common/enums/notification.enum");
let ActionsService = class ActionsService {
    constructor(actionTokens, conversationStateService, notificationModel, userModel, interactionEventModel, reminderModel) {
        this.actionTokens = actionTokens;
        this.conversationStateService = conversationStateService;
        this.notificationModel = notificationModel;
        this.userModel = userModel;
        this.interactionEventModel = interactionEventModel;
        this.reminderModel = reminderModel;
    }
    async handle(token) {
        const payload = await this.actionTokens.verify(token);
        if (payload.typ !== 'action') {
            return this.renderResult('Invalid link.', undefined);
        }
        const user = await this.userModel.findById(payload.sub).lean().exec();
        if (!user || user.role !== user_enum_1.UserRole.Monitor) {
            return this.renderResult('User not allowed.', undefined);
        }
        const notif = await this.notificationModel.findById(payload.notificationId).lean().exec();
        if (!notif)
            throw new common_1.NotFoundException('Notification not found');
        if (String(notif.toUserId) !== String(payload.sub)) {
            return this.renderResult('This link is not assigned to you.', undefined);
        }
        const state = await this.conversationStateService.get(String(payload.sub), payload.contextType, payload.contextId);
        if (!state) {
            return this.renderResult('This link is expired or already used.', payload.redirectUrl);
        }
        if (String(state.lastNotificationId ?? '') !== String(notif._id)) {
            return this.renderResult('This link is expired or already replaced.', payload.redirectUrl);
        }
        if (!(state.allowedResponses ?? []).includes(payload.actionId)) {
            return this.renderResult('This action is not allowed.', payload.redirectUrl);
        }
        if (state.expiresAt && new Date(state.expiresAt).getTime() < Date.now()) {
            return this.renderResult('This link is expired.', payload.redirectUrl);
        }
        const meta = payload.actionId.startsWith('RESP:')
            ? { value: payload.actionId.substring('RESP:'.length) }
            : undefined;
        await this.interactionEventModel.create({
            userId: new mongoose_2.Types.ObjectId(String(payload.sub)),
            notificationId: new mongoose_2.Types.ObjectId(String(notif._id)),
            contextType: payload.contextType,
            contextId: payload.contextId,
            actionId: payload.actionId,
            meta,
        });
        if (payload.contextType === notification_enum_1.NotificationContextType.Reminder ||
            payload.contextType === notification_enum_1.NotificationContextType.GroupChange) {
            await this.applyReminderAction(payload.contextId, String(payload.sub), payload.actionId);
        }
        await this.conversationStateService.complete(String(payload.sub), payload.contextType, payload.contextId);
        const isDetails = payload.actionId === 'DETAILS' || payload.actionId === 'OPEN_PROFILE';
        return this.renderResult(isDetails ? 'Opening…' : 'Action recorded.', payload.redirectUrl, {
            autoRedirect: isDetails,
        });
    }
    async applyReminderAction(reminderId, userId, actionId) {
        const reminder = await this.reminderModel.findById(reminderId).lean().exec();
        if (!reminder)
            return;
        const isAck = actionId === 'ACK' || actionId.startsWith('RESP:');
        if (!isAck)
            return;
        const updated = await this.reminderModel
            .findByIdAndUpdate(reminderId, {
            $pull: { awaitingAckUserIds: userId },
            $addToSet: { acknowledgedByUserIds: userId },
        }, { new: true })
            .lean()
            .exec();
        if (!updated)
            return;
        if ((updated.awaitingAckUserIds ?? []).length > 0) {
            return;
        }
        if (updated.schedule?.type === reminder_schema_1.ReminderScheduleType.Once || !updated.schedule?.type) {
            await this.reminderModel.findByIdAndUpdate(reminderId, {
                $set: { status: notification_enum_2.ReminderStatus.Ended, nextRunAt: undefined },
            });
            return;
        }
        const base = updated.lastSentAt ? new Date(updated.lastSentAt) : new Date();
        const nextRunAt = (0, recurrence_util_1.computeNextRunAt)(updated.schedule, base);
        await this.reminderModel.findByIdAndUpdate(reminderId, {
            $set: {
                nextRunAt,
                acknowledgedByUserIds: [],
            },
        });
    }
    renderResult(message, redirectUrl, opts) {
        const url = redirectUrl?.replace(/"/g, '');
        const refresh = opts?.autoRedirect && url ? `<meta http-equiv="refresh" content="0;url=${url}">` : '';
        return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    ${refresh}
    <title>Action</title>
  </head>
  <body style="font-family: Arial, sans-serif; padding: 24px; background:#0b1220; color:#e5e7eb;">
    <div style="max-width: 720px; margin: 0 auto; background:#111827; padding: 24px; border-radius: 12px;">
      <h2 style="margin:0 0 12px;">${message}</h2>
      ${url
            ? `<p><a href="${url}" style="color:#93c5fd;">Continue</a></p>`
            : `<p>You can close this page.</p>`}
    </div>
  </body>
</html>`;
    }
};
exports.ActionsService = ActionsService;
exports.ActionsService = ActionsService = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, mongoose_1.InjectModel)(notification_schema_1.Notification.name)),
    __param(3, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __param(4, (0, mongoose_1.InjectModel)(interaction_event_schema_1.InteractionEvent.name)),
    __param(5, (0, mongoose_1.InjectModel)(reminder_schema_1.Reminder.name)),
    __metadata("design:paramtypes", [action_tokens_service_1.ActionTokensService,
        conversation_state_service_1.ConversationStateService,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model])
], ActionsService);
//# sourceMappingURL=actions.service.js.map