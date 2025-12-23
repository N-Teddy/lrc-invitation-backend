import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ActionTokensService } from '../common/services/action-tokens.service';
import { ConversationStateService } from '../conversations/conversation-state.service';
import { Notification, NotificationDocument } from '../schema/notification.schema';
import { User, UserDocument } from '../schema/user.schema';
import { InteractionEvent, InteractionEventDocument } from '../schema/interaction-event.schema';
import { NotificationContextType } from '../common/enums/notification.enum';
import { UserRole } from '../common/enums/user.enum';
import { Reminder, ReminderDocument, ReminderScheduleType } from '../schema/reminder.schema';
import { computeNextRunAt } from '../common/utils/recurrence.util';
import { ReminderStatus } from '../common/enums/notification.enum';

@Injectable()
export class ActionsService {
    constructor(
        private readonly actionTokens: ActionTokensService,
        private readonly conversationStateService: ConversationStateService,
        @InjectModel(Notification.name)
        private readonly notificationModel: Model<NotificationDocument>,
        @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
        @InjectModel(InteractionEvent.name)
        private readonly interactionEventModel: Model<InteractionEventDocument>,
        @InjectModel(Reminder.name) private readonly reminderModel: Model<ReminderDocument>,
    ) {}

    async handle(token: string) {
        const payload = await this.actionTokens.verify(token);
        if (payload.typ !== 'action') {
            return this.renderResult('Invalid link.', undefined);
        }

        const user = await this.userModel.findById(payload.sub).lean().exec();
        if (!user || user.role !== UserRole.Monitor) {
            return this.renderResult('User not allowed.', undefined);
        }

        const notif = await this.notificationModel.findById(payload.notificationId).lean().exec();
        if (!notif) throw new NotFoundException('Notification not found');
        if (String(notif.toUserId) !== String(payload.sub)) {
            return this.renderResult('This link is not assigned to you.', undefined);
        }

        const state = await this.conversationStateService.get(
            String(payload.sub),
            payload.contextType,
            payload.contextId,
        );

        if (!state) {
            return this.renderResult('This link is expired or already used.', payload.redirectUrl);
        }
        if (String(state.lastNotificationId ?? '') !== String(notif._id)) {
            return this.renderResult(
                'This link is expired or already replaced.',
                payload.redirectUrl,
            );
        }
        if (!(state.allowedResponses ?? []).includes(payload.actionId)) {
            return this.renderResult('This action is not allowed.', payload.redirectUrl);
        }
        if (state.expiresAt && new Date(state.expiresAt).getTime() < Date.now()) {
            return this.renderResult('This link is expired.', payload.redirectUrl);
        }

        const meta: Record<string, any> | undefined = payload.actionId.startsWith('RESP:')
            ? { value: payload.actionId.substring('RESP:'.length) }
            : undefined;

        await this.interactionEventModel.create({
            userId: new Types.ObjectId(String(payload.sub)),
            notificationId: new Types.ObjectId(String(notif._id)),
            contextType: payload.contextType,
            contextId: payload.contextId,
            actionId: payload.actionId,
            meta,
        });

        if (
            payload.contextType === NotificationContextType.Reminder ||
            payload.contextType === NotificationContextType.GroupChange
        ) {
            await this.applyReminderAction(
                payload.contextId,
                String(payload.sub),
                payload.actionId,
            );
        }

        await this.conversationStateService.complete(
            String(payload.sub),
            payload.contextType,
            payload.contextId,
        );

        const isDetails = payload.actionId === 'DETAILS' || payload.actionId === 'OPEN_PROFILE';
        return this.renderResult(isDetails ? 'Opening…' : 'Action recorded.', payload.redirectUrl, {
            autoRedirect: isDetails,
        });
    }

    private async applyReminderAction(reminderId: string, userId: string, actionId: string) {
        const reminder = await this.reminderModel.findById(reminderId).lean().exec();
        if (!reminder) return;

        const isAck = actionId === 'ACK' || actionId.startsWith('RESP:');
        if (!isAck) return;

        const updated = await this.reminderModel
            .findByIdAndUpdate(
                reminderId,
                {
                    $pull: { awaitingAckUserIds: userId },
                    $addToSet: { acknowledgedByUserIds: userId },
                },
                { new: true },
            )
            .lean()
            .exec();
        if (!updated) return;

        if ((updated.awaitingAckUserIds ?? []).length > 0) {
            return;
        }

        if (updated.schedule?.type === ReminderScheduleType.Once || !updated.schedule?.type) {
            await this.reminderModel.findByIdAndUpdate(reminderId, {
                $set: { status: ReminderStatus.Ended, nextRunAt: undefined },
            });
            return;
        }

        const base = updated.lastSentAt ? new Date(updated.lastSentAt) : new Date();
        const nextRunAt = computeNextRunAt(updated.schedule as any, base);
        await this.reminderModel.findByIdAndUpdate(reminderId, {
            $set: {
                nextRunAt,
                acknowledgedByUserIds: [],
            },
        });
    }

    private renderResult(message: string, redirectUrl?: string, opts?: { autoRedirect?: boolean }) {
        const url = redirectUrl?.replace(/"/g, '');
        const refresh =
            opts?.autoRedirect && url ? `<meta http-equiv="refresh" content="0;url=${url}">` : '';

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
      ${
          url
              ? `<p><a href="${url}" style="color:#93c5fd;">Continue</a></p>`
              : `<p>You can close this page.</p>`
      }
    </div>
  </body>
</html>`;
    }
}
