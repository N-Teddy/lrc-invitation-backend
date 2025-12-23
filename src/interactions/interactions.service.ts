import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { NotificationContextType } from '../common/enums/notification.enum';
import { MonitorLevel, UserRole } from '../common/enums/user.enum';
import { Activity, ActivityDocument } from '../schema/activity.schema';
import { InteractionEvent, InteractionEventDocument } from '../schema/interaction-event.schema';
import { Reminder, ReminderDocument } from '../schema/reminder.schema';
import { User, UserDocument } from '../schema/user.schema';

@Injectable()
export class InteractionsService {
    constructor(
        @InjectModel(InteractionEvent.name)
        private readonly interactionEventModel: Model<InteractionEventDocument>,
        @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
        @InjectModel(Reminder.name) private readonly reminderModel: Model<ReminderDocument>,
        @InjectModel(Activity.name) private readonly activityModel: Model<ActivityDocument>,
    ) {}

    async listMine(currentUser: Record<string, any>, limit = 50, cursor?: string) {
        const userId = String(currentUser?._id ?? currentUser?.id);
        if (!userId) throw new ForbiddenException('Missing user');

        const query: Record<string, any> = { userId: new Types.ObjectId(userId) };
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

    async listByContext(
        contextType: NotificationContextType,
        contextId: string,
        currentUser: Record<string, any>,
        limit = 50,
        cursor?: string,
    ) {
        await this.assertCanReadContext(contextType, contextId, currentUser);

        const query: Record<string, any> = {
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
                  .find({ _id: { $in: userIds.map((id) => new Types.ObjectId(id)) } })
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

    private async assertCanReadContext(
        contextType: NotificationContextType,
        contextId: string,
        currentUser: Record<string, any>,
    ) {
        if (currentUser?.role !== UserRole.Monitor) {
            throw new ForbiddenException('Only monitors can view interactions');
        }
        if (currentUser?.monitorLevel === MonitorLevel.Super) return;

        const userId = String(currentUser?._id ?? currentUser?.id);
        if (!userId) throw new ForbiddenException('Missing user');

        if (
            contextType === NotificationContextType.Reminder ||
            contextType === NotificationContextType.GroupChange
        ) {
            const reminder = await this.reminderModel.findById(contextId).lean().exec();
            if (!reminder) throw new NotFoundException('Reminder not found');

            const createdBy = reminder.createdByUserId
                ? String(reminder.createdByUserId)
                : undefined;
            const isRecipient = (reminder.recipients ?? []).includes(userId);
            if (createdBy === userId || isRecipient) return;
            throw new ForbiddenException('Not allowed');
        }

        if (
            contextType === NotificationContextType.Activity ||
            contextType === NotificationContextType.Conference
        ) {
            const activity = await this.activityModel.findById(contextId).lean().exec();
            if (!activity) throw new NotFoundException('Activity not found');
            const createdBy = activity.createdByUserId
                ? String(activity.createdByUserId)
                : undefined;
            if (createdBy === userId) return;
            throw new ForbiddenException('Not allowed');
        }

        // Attendance reports, birthdays, transitions, payments: super only for now.
        throw new ForbiddenException('Not allowed');
    }
}
