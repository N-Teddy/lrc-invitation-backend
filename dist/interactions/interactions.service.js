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
exports.InteractionsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const notification_enum_1 = require("../common/enums/notification.enum");
const user_enum_1 = require("../common/enums/user.enum");
const activity_schema_1 = require("../schema/activity.schema");
const interaction_event_schema_1 = require("../schema/interaction-event.schema");
const reminder_schema_1 = require("../schema/reminder.schema");
const user_schema_1 = require("../schema/user.schema");
let InteractionsService = class InteractionsService {
    constructor(interactionEventModel, userModel, reminderModel, activityModel) {
        this.interactionEventModel = interactionEventModel;
        this.userModel = userModel;
        this.reminderModel = reminderModel;
        this.activityModel = activityModel;
    }
    async listMine(currentUser, limit = 50, cursor) {
        const userId = String(currentUser?._id ?? currentUser?.id);
        if (!userId)
            throw new common_1.ForbiddenException('Missing user');
        const query = { userId: new mongoose_2.Types.ObjectId(userId) };
        if (cursor) {
            const ms = Number(cursor);
            if (!Number.isNaN(ms)) {
                query.createdAt = { $lt: new Date(ms) };
            }
        }
        const docs = await this.interactionEventModel
            .find(query)
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean()
            .exec();
        const user = await this.userModel
            .findById(userId)
            .select({ _id: 1, fullName: 1 })
            .lean()
            .exec();
        const userName = user?.fullName ?? userId;
        const items = docs.map((d) => ({
            id: String(d._id),
            userId,
            userName,
            notificationId: d.notificationId ? String(d.notificationId) : undefined,
            contextType: d.contextType,
            contextId: d.contextId,
            actionId: d.actionId,
            meta: d.meta,
            createdAt: d.createdAt,
        }));
        const nextCursor = docs.length
            ? String(new Date(docs[docs.length - 1].createdAt).getTime())
            : undefined;
        return { items, nextCursor };
    }
    async listByContext(contextType, contextId, currentUser, limit = 50, cursor) {
        await this.assertCanReadContext(contextType, contextId, currentUser);
        const query = {
            contextType,
            contextId,
        };
        if (cursor) {
            const ms = Number(cursor);
            if (!Number.isNaN(ms)) {
                query.createdAt = { $lt: new Date(ms) };
            }
        }
        const docs = await this.interactionEventModel
            .find(query)
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean()
            .exec();
        const userIds = [...new Set(docs.map((d) => String(d.userId)))];
        const users = userIds.length
            ? await this.userModel
                .find({ _id: { $in: userIds.map((id) => new mongoose_2.Types.ObjectId(id)) } })
                .select({ _id: 1, fullName: 1 })
                .lean()
                .exec()
            : [];
        const userNameById = new Map(users.map((u) => [String(u._id), u.fullName]));
        const items = docs.map((d) => ({
            id: String(d._id),
            userId: String(d.userId),
            userName: userNameById.get(String(d.userId)) ?? String(d.userId),
            notificationId: d.notificationId ? String(d.notificationId) : undefined,
            contextType: d.contextType,
            contextId: d.contextId,
            actionId: d.actionId,
            meta: d.meta,
            createdAt: d.createdAt,
        }));
        const nextCursor = docs.length
            ? String(new Date(docs[docs.length - 1].createdAt).getTime())
            : undefined;
        return { items, nextCursor };
    }
    async assertCanReadContext(contextType, contextId, currentUser) {
        if (currentUser?.role !== user_enum_1.UserRole.Monitor) {
            throw new common_1.ForbiddenException('Only monitors can view interactions');
        }
        if (currentUser?.monitorLevel === user_enum_1.MonitorLevel.Super)
            return;
        const userId = String(currentUser?._id ?? currentUser?.id);
        if (!userId)
            throw new common_1.ForbiddenException('Missing user');
        if (contextType === notification_enum_1.NotificationContextType.Reminder ||
            contextType === notification_enum_1.NotificationContextType.GroupChange) {
            const reminder = await this.reminderModel.findById(contextId).lean().exec();
            if (!reminder)
                throw new common_1.NotFoundException('Reminder not found');
            const createdBy = reminder.createdByUserId
                ? String(reminder.createdByUserId)
                : undefined;
            const isRecipient = (reminder.recipients ?? []).includes(userId);
            if (createdBy === userId || isRecipient)
                return;
            throw new common_1.ForbiddenException('Not allowed');
        }
        if (contextType === notification_enum_1.NotificationContextType.Activity ||
            contextType === notification_enum_1.NotificationContextType.Conference) {
            const activity = await this.activityModel.findById(contextId).lean().exec();
            if (!activity)
                throw new common_1.NotFoundException('Activity not found');
            const createdBy = activity.createdByUserId
                ? String(activity.createdByUserId)
                : undefined;
            if (createdBy === userId)
                return;
            throw new common_1.ForbiddenException('Not allowed');
        }
        throw new common_1.ForbiddenException('Not allowed');
    }
};
exports.InteractionsService = InteractionsService;
exports.InteractionsService = InteractionsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(interaction_event_schema_1.InteractionEvent.name)),
    __param(1, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __param(2, (0, mongoose_1.InjectModel)(reminder_schema_1.Reminder.name)),
    __param(3, (0, mongoose_1.InjectModel)(activity_schema_1.Activity.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model])
], InteractionsService);
//# sourceMappingURL=interactions.service.js.map