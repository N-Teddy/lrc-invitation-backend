import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Notification, NotificationDocument } from '../schema/notification.schema';
import {
    Channel,
    NotificationContextType,
    NotificationStatus,
} from '../common/enums/notification.enum';
import { EmailNotificationSender } from './email.sender';
import { WhatsAppNotificationSender } from './whatsapp.stub.sender';
import { SendOptions } from '../common/interfaces/notification-sender.interface';
import { NotificationsGateway } from './notifications.gateway';
import { AppConfigService } from '../config/app-config.service';
import { User, UserDocument } from '../schema/user.schema';
import { computeBackoffMs } from '../common/utils/backoff.util';

@Injectable()
export class NotificationService {
    private readonly logger = new Logger(NotificationService.name);

    constructor(
        @InjectModel(Notification.name)
        private readonly notificationModel: Model<NotificationDocument>,
        @InjectModel(User.name)
        private readonly userModel: Model<UserDocument>,
        private readonly emailSender: EmailNotificationSender,
        private readonly whatsappSender: WhatsAppNotificationSender,
        private readonly notificationsGateway: NotificationsGateway,
        private readonly config: AppConfigService,
    ) {}

    async send(
        options: Omit<SendOptions, 'contextType'> & { contextType: NotificationContextType },
    ) {
        const subject = options.subject ?? 'Notification';
        const templateName = options.templateName ?? 'generic-notification';
        const templateData =
            options.templateData ??
            (templateName === 'generic-notification'
                ? {
                      subject,
                      headline: subject,
                      message: options.message,
                  }
                : undefined);

        const primaryChannel = this.getPrimaryChannel();
        const notif = await new this.notificationModel({
            primaryChannel,
            channelUsed: primaryChannel,
            fallbackUsed: false,
            toUserId: new Types.ObjectId(options.userId),
            contextType: options.contextType,
            contextId: options.contextId,
            status: NotificationStatus.Queued,
            templateName,
            templateLanguage: 'en',
            languageUsed: 'en',
            languageFallbackUsed: false,
            interactiveOptions: [],
            payload: {
                subject,
                message: options.message,
                templateName,
                templateData,
            },
            attempts: 0,
            maxAttempts: 6,
            nextAttemptAt: new Date(),
        }).save();

        try {
            await this.dispatchNotification(String(notif._id));
        } catch (err) {
            const attempt = (notif.attempts ?? 0) + 1;
            await this.notificationModel.findByIdAndUpdate(notif._id, {
                status: NotificationStatus.Failed,
                error: err?.message ?? String(err),
                nextAttemptAt: new Date(Date.now() + computeBackoffMs(attempt)),
            });
        }
        return notif.toObject();
    }

    async processDueNotifications(now = new Date()) {
        const due = await this.notificationModel
            .find({
                status: { $in: [NotificationStatus.Queued, NotificationStatus.Failed] },
                nextAttemptAt: { $ne: null, $lte: now },
                $expr: { $lt: ['$attempts', '$maxAttempts'] },
            })
            .select({ _id: 1 })
            .lean()
            .exec();

        for (const item of due) {
            await this.dispatchNotification(String(item._id));
        }
    }

    private getPrimaryChannel(): Channel {
        return this.config.notificationProvider === 'whatsapp' ? Channel.WhatsApp : Channel.Email;
    }

    private getFallbackChannel(primary: Channel): Channel | undefined {
        if (primary === Channel.WhatsApp) {
            return this.config.notificationFallbackProvider === 'email' ? Channel.Email : undefined;
        }
        return undefined;
    }

    private isWhatsAppAvailable() {
        return (
            this.config.whatsAppEnabled &&
            !!this.config.whatsAppAccessToken &&
            !!this.config.whatsAppPhoneNumberId &&
            !!this.config.whatsAppBusinessAccountId
        );
    }

    private async dispatchNotification(notificationId: string) {
        const notif = await this.notificationModel.findById(notificationId).lean().exec();
        if (!notif) return;
        if (notif.status === NotificationStatus.Sent) return;

        const attempt = (notif.attempts ?? 0) + 1;
        const maxAttempts = notif.maxAttempts ?? 6;
        await this.notificationModel.findByIdAndUpdate(notificationId, {
            $set: { lastAttemptAt: new Date() },
            $inc: { attempts: 1 },
        });

        const user = await this.userModel.findById(notif.toUserId).lean().exec();
        if (!user) {
            await this.notificationModel.findByIdAndUpdate(notificationId, {
                status: NotificationStatus.Failed,
                error: 'User not found',
                skipReason: 'user_not_found',
                nextAttemptAt: undefined,
            });
            return;
        }

        const primary = notif.primaryChannel as Channel;
        const fallback = this.getFallbackChannel(primary);

        const payload = (notif.payload ?? {}) as Record<string, any>;
        const sendResult = await this.trySendInOrder(
            [
                { channel: primary, fallbackUsed: false },
                ...(fallback ? [{ channel: fallback, fallbackUsed: true }] : []),
                { channel: Channel.InApp, fallbackUsed: true },
            ],
            user,
            notif,
            payload,
        );

        if (sendResult.sent) {
            await this.notificationModel.findByIdAndUpdate(notificationId, {
                status: NotificationStatus.Sent,
                sentAt: new Date(),
                channelUsed: sendResult.channelUsed,
                fallbackUsed: sendResult.fallbackUsed,
                skipReason: sendResult.skipReason,
                error: undefined,
                nextAttemptAt: undefined,
            });
            return;
        }

        if (attempt >= maxAttempts) {
            this.logger.error(
                `Dead-letter notification ${notificationId} after ${attempt}/${maxAttempts} attempts: ${sendResult.error ?? sendResult.skipReason ?? 'unknown_error'}`,
            );
            await this.notificationModel.findByIdAndUpdate(notificationId, {
                status: NotificationStatus.Failed,
                error: sendResult.error ?? 'Notification send failed',
                skipReason: sendResult.skipReason ?? 'max_attempts_reached',
                nextAttemptAt: undefined,
            });
            return;
        }

        const delayMs = computeBackoffMs(attempt);
        await this.notificationModel.findByIdAndUpdate(notificationId, {
            status: NotificationStatus.Failed,
            error: sendResult.error ?? 'Notification send failed',
            skipReason: sendResult.skipReason,
            nextAttemptAt: new Date(Date.now() + delayMs),
        });
    }

    private async trySendInOrder(
        candidates: Array<{ channel: Channel; fallbackUsed: boolean }>,
        user: Record<string, any>,
        notif: Record<string, any>,
        payload: Record<string, any>,
    ): Promise<{
        sent: boolean;
        channelUsed?: Channel;
        fallbackUsed?: boolean;
        skipReason?: string;
        error?: string;
    }> {
        let lastError: string | undefined;

        for (const candidate of candidates) {
            const result = await this.trySend(candidate.channel, user, notif, payload);
            if (result.sent) {
                return {
                    sent: true,
                    channelUsed: candidate.channel,
                    fallbackUsed: candidate.fallbackUsed,
                    skipReason: result.skipReason,
                };
            }
            if (result.skipReason) {
                lastError = result.error ?? lastError;
                continue;
            }
            lastError = result.error ?? lastError;
        }

        return {
            sent: false,
            error: lastError,
            skipReason: 'all_channels_failed',
        };
    }

    private async trySend(
        channel: Channel,
        user: Record<string, any>,
        notif: Record<string, any>,
        payload: Record<string, any>,
    ): Promise<{ sent: boolean; skipReason?: string; error?: string }> {
        if (channel === Channel.WhatsApp) {
            if (!this.isWhatsAppAvailable()) {
                return { sent: false, skipReason: 'whatsapp_unavailable' };
            }
            if (user.whatsApp?.optIn === false) {
                return { sent: false, skipReason: 'whatsapp_opt_out' };
            }
            const to = user.whatsApp?.phoneE164 as string | undefined;
            if (!to) {
                return { sent: false, skipReason: 'no_whatsapp_number' };
            }
            try {
                await this.whatsappSender.send({
                    userId: String(user._id),
                    to,
                    subject: payload.subject,
                    message: payload.message,
                    templateName: payload.templateName,
                    templateData: payload.templateData,
                    contextType: notif.contextType as NotificationContextType,
                    contextId: String(notif.contextId),
                });
                this.emitInApp(user, notif, payload);
                return { sent: true };
            } catch (err) {
                return { sent: false, error: err?.message ?? String(err) };
            }
        }

        if (channel === Channel.Email) {
            const to = user.email as string | undefined;
            if (!to) {
                return { sent: false, skipReason: 'no_email' };
            }
            try {
                await this.emailSender.send({
                    userId: String(user._id),
                    to,
                    subject: payload.subject,
                    message: payload.message,
                    templateName: payload.templateName,
                    templateData: payload.templateData,
                    contextType: notif.contextType as NotificationContextType,
                    contextId: String(notif.contextId),
                });
                this.emitInApp(user, notif, payload);
                return { sent: true };
            } catch (err) {
                return { sent: false, error: err?.message ?? String(err) };
            }
        }

        if (channel === Channel.InApp) {
            if (!this.config.inAppNotificationsEnabled) {
                return { sent: false, skipReason: 'in_app_disabled' };
            }
            try {
                this.emitInApp(user, notif, payload);
                return { sent: true };
            } catch (err) {
                return { sent: false, error: err?.message ?? String(err) };
            }
        }

        return { sent: false, skipReason: 'unsupported_channel' };
    }

    private emitInApp(
        user: Record<string, any>,
        notif: Record<string, any>,
        payload: Record<string, any>,
    ) {
        this.notificationsGateway.emitToUser(String(user._id), 'notification', {
            notificationId: String(notif._id),
            contextType: notif.contextType,
            contextId: notif.contextId,
            title: payload.subject ?? 'Notification',
            message: payload.message,
            channelUsed: notif.channelUsed ?? notif.primaryChannel,
        });
    }
}
