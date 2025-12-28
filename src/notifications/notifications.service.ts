import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    Logger,
    NotFoundException,
} from '@nestjs/common';
import { existsSync } from 'fs';
import { join } from 'path';
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
import { ActionTokensService } from '../common/services/action-tokens.service';
import { ConversationStateService } from '../conversations/conversation-state.service';
import { SettingsService } from '../settings/settings.service';
import { NotificationsListQueryDto } from '../dtos/request/notifications.dto';

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
        private readonly settingsService: SettingsService,
        private readonly actionTokensService: ActionTokensService,
        private readonly conversationStateService: ConversationStateService,
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
            templateLanguage: 'auto',
            languageUsed: 'auto',
            languageFallbackUsed: false,
            interactiveOptions: (options.actions ?? []).map((a) => ({ id: a.id, label: a.label })),
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

        if (options.actions?.length) {
            const expiresAt =
                options.conversation?.expiresAt ?? new Date(Date.now() + 24 * 60 * 60 * 1000);

            const actionLinks = options.actions.map((a) => {
                const token = this.actionTokensService.sign(
                    {
                        typ: 'action',
                        sub: options.userId,
                        notificationId: String(notif._id),
                        contextType: options.contextType,
                        contextId: options.contextId,
                        actionId: a.id,
                        redirectUrl: a.redirectUrl,
                    },
                    expiresAt,
                );
                return {
                    id: a.id,
                    label: a.label,
                    url: `${this.config.apiBaseUrl}/actions/${token}`,
                };
            });

            const actionsHtml = actionLinks
                .map(
                    (a) =>
                        `<a href="${a.url}" style="display:inline-block;margin:6px 8px 6px 0;background:#2563eb;color:#fff;padding:10px 14px;text-decoration:none;border-radius:8px;">${a.label}</a>`,
                )
                .join('');

            const actionsText = actionLinks.map((a) => `${a.label}: ${a.url}`).join('\n');

            const updatedTemplateData: Record<string, any> = {
                ...(templateData ?? {}),
                actions: actionLinks,
                actionsHtml,
                actionsText,
            };

            if (actionLinks.length === 1) {
                updatedTemplateData.actionUrl = actionLinks[0].url;
                updatedTemplateData.actionLabel = actionLinks[0].label;
            }

            await this.notificationModel.findByIdAndUpdate(notif._id, {
                $set: {
                    interactiveOptions: actionLinks.map((a) => ({ id: a.id, label: a.label })),
                    'payload.templateData': updatedTemplateData,
                },
            });

            if (options.conversation) {
                await this.conversationStateService.upsert({
                    userId: options.userId,
                    contextType: options.contextType,
                    contextId: options.contextId,
                    state: options.conversation.state,
                    allowedResponses: options.conversation.allowedResponses,
                    expiresAt: options.conversation.expiresAt,
                    lastNotificationId: String(notif._id),
                });
            }
        }

        void this.dispatchNotification(String(notif._id)).catch(async (err) => {
            const attempt = (notif.attempts ?? 0) + 1;
            await this.notificationModel.findByIdAndUpdate(notif._id, {
                status: NotificationStatus.Failed,
                error: err?.message ?? String(err),
                nextAttemptAt: new Date(Date.now() + computeBackoffMs(attempt)),
            });
        });
        return notif.toObject();
    }

    async listForUser(currentUser: Record<string, any>, query: NotificationsListQueryDto) {
        const userId = String(currentUser?.id ?? currentUser?._id ?? '');
        if (!userId) throw new ForbiddenException('Missing user');

        const page = Math.max(1, Number(query?.page ?? 1));
        const limit = Math.min(100, Math.max(1, Number(query?.limit ?? 20)));
        const skip = (page - 1) * limit;

        const filter: Record<string, any> = { toUserId: new Types.ObjectId(userId) };
        if (query?.status) filter.status = query.status;
        if (query?.contextType) filter.contextType = query.contextType;
        if (query?.channelUsed) filter.channelUsed = query.channelUsed;

        if (query?.q?.trim()) {
            const q = String(query.q).trim();
            const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
            filter.$or = [{ 'payload.subject': rx }, { 'payload.message': rx }];
        }

        const [total, docs] = await Promise.all([
            this.notificationModel.countDocuments(filter),
            this.notificationModel
                .find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean()
                .exec(),
        ]);

        const items = docs.map((n) => this.toListItem(n));
        return { items, page, limit, total, hasMore: skip + items.length < total };
    }

    async getForUser(currentUser: Record<string, any>, notificationId: string) {
        const userId = String(currentUser?.id ?? currentUser?._id ?? '');
        if (!userId) throw new ForbiddenException('Missing user');

        const notif = await this.notificationModel.findById(notificationId).lean().exec();
        if (!notif) throw new NotFoundException('Notification not found');
        if (String(notif.toUserId) !== userId) throw new ForbiddenException('Not allowed');

        return this.toDetails(notif);
    }

    async markRead(currentUser: Record<string, any>, notificationId: string) {
        const userId = String(currentUser?.id ?? currentUser?._id ?? '');
        if (!userId) throw new ForbiddenException('Missing user');

        const notif = await this.notificationModel.findById(notificationId).lean().exec();
        if (!notif) throw new NotFoundException('Notification not found');
        if (String(notif.toUserId) !== userId) throw new ForbiddenException('Not allowed');

        if (
            notif.status !== NotificationStatus.Acknowledged &&
            notif.status !== NotificationStatus.Read
        ) {
            await this.notificationModel.findByIdAndUpdate(notificationId, {
                $set: { status: NotificationStatus.Read },
            });
        }

        return this.getForUser(currentUser, notificationId);
    }

    async retryNow(currentUser: Record<string, any>, notificationId: string) {
        const userId = String(currentUser?.id ?? currentUser?._id ?? '');
        if (!userId) throw new ForbiddenException('Missing user');

        const notif = await this.notificationModel.findById(notificationId).lean().exec();
        if (!notif) throw new NotFoundException('Notification not found');
        if (String(notif.toUserId) !== userId) throw new ForbiddenException('Not allowed');

        if (notif.status !== NotificationStatus.Failed) {
            throw new BadRequestException('Only failed notifications can be retried');
        }

        if ((notif.attempts ?? 0) >= (notif.maxAttempts ?? 6)) {
            throw new BadRequestException('Max attempts reached');
        }

        await this.notificationModel.findByIdAndUpdate(notificationId, {
            $set: {
                status: NotificationStatus.Queued,
                nextAttemptAt: new Date(),
                error: undefined,
                skipReason: undefined,
            },
        });

        await this.dispatchNotification(notificationId);
        return this.getForUser(currentUser, notificationId);
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

    private toListItem(notif: Record<string, any>) {
        const payload = (notif.payload ?? {}) as Record<string, any>;
        const templateData = (payload.templateData ?? {}) as Record<string, any>;

        return {
            id: String(notif._id),
            contextType: notif.contextType,
            contextId: String(notif.contextId),
            status: notif.status,
            primaryChannel: notif.primaryChannel,
            channelUsed: notif.channelUsed,
            fallbackUsed: notif.fallbackUsed,
            title: payload.subject ?? templateData.subject ?? 'Notification',
            message: payload.message ?? templateData.message ?? '',
            error: notif.error,
            attempts: notif.attempts,
            maxAttempts: notif.maxAttempts,
            createdAt: notif.createdAt,
            sentAt: notif.sentAt,
        };
    }

    private toDetails(notif: Record<string, any>) {
        return {
            id: String(notif._id),
            contextType: notif.contextType,
            contextId: String(notif.contextId),
            status: notif.status,
            primaryChannel: notif.primaryChannel,
            channelUsed: notif.channelUsed,
            fallbackUsed: notif.fallbackUsed,
            skipReason: notif.skipReason,
            templateName: notif.templateName,
            templateLanguage: notif.templateLanguage,
            languageUsed: notif.languageUsed,
            languageFallbackUsed: notif.languageFallbackUsed,
            payload: notif.payload,
            error: notif.error,
            attempts: notif.attempts,
            maxAttempts: notif.maxAttempts,
            nextAttemptAt: notif.nextAttemptAt,
            lastAttemptAt: notif.lastAttemptAt,
            createdAt: notif.createdAt,
            updatedAt: notif.updatedAt,
            sentAt: notif.sentAt,
        };
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
        const languages = await this.settingsService.getLanguages();
        const requestedLanguage =
            (user.preferredLanguage as string | undefined) ?? languages.defaultLanguage ?? 'en';
        payload.templateLanguage = requestedLanguage;

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
                templateLanguage: requestedLanguage,
                languageUsed: sendResult.languageUsed ?? requestedLanguage,
                languageFallbackUsed: sendResult.languageFallbackUsed ?? false,
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
                templateLanguage: requestedLanguage,
                languageUsed: sendResult.languageUsed ?? requestedLanguage,
                languageFallbackUsed: sendResult.languageFallbackUsed ?? false,
                nextAttemptAt: undefined,
            });
            return;
        }

        const delayMs = computeBackoffMs(attempt);
        await this.notificationModel.findByIdAndUpdate(notificationId, {
            status: NotificationStatus.Failed,
            error: sendResult.error ?? 'Notification send failed',
            skipReason: sendResult.skipReason,
            templateLanguage: requestedLanguage,
            languageUsed: sendResult.languageUsed ?? requestedLanguage,
            languageFallbackUsed: sendResult.languageFallbackUsed ?? false,
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
        languageUsed?: string;
        languageFallbackUsed?: boolean;
    }> {
        let lastError: string | undefined;
        let languageUsed: string | undefined;
        let languageFallbackUsed: boolean | undefined;

        for (const candidate of candidates) {
            const result = await this.trySend(candidate.channel, user, notif, payload);
            if (result.sent) {
                return {
                    sent: true,
                    channelUsed: candidate.channel,
                    fallbackUsed: candidate.fallbackUsed,
                    skipReason: result.skipReason,
                    languageUsed: result.languageUsed,
                    languageFallbackUsed: result.languageFallbackUsed,
                };
            }
            if (result.skipReason) {
                lastError = result.error ?? lastError;
                languageUsed = result.languageUsed ?? languageUsed;
                languageFallbackUsed = result.languageFallbackUsed ?? languageFallbackUsed;
                continue;
            }
            lastError = result.error ?? lastError;
            languageUsed = result.languageUsed ?? languageUsed;
            languageFallbackUsed = result.languageFallbackUsed ?? languageFallbackUsed;
        }

        return {
            sent: false,
            error: lastError,
            skipReason: 'all_channels_failed',
            languageUsed,
            languageFallbackUsed,
        };
    }

    private async trySend(
        channel: Channel,
        user: Record<string, any>,
        notif: Record<string, any>,
        payload: Record<string, any>,
    ): Promise<{
        sent: boolean;
        skipReason?: string;
        error?: string;
        languageUsed?: string;
        languageFallbackUsed?: boolean;
    }> {
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
                return { sent: true, languageUsed: payload.templateLanguage };
            } catch (err) {
                return { sent: false, error: err?.message ?? String(err) };
            }
        }

        if (channel === Channel.Email) {
            const to = user.email as string | undefined;
            if (!to) {
                return { sent: false, skipReason: 'no_email' };
            }

            const baseTemplateName = String(payload.templateName ?? 'generic-notification');
            const requested = String(payload.templateLanguage ?? 'en');
            const variant = this.resolveEmailTemplateVariant(baseTemplateName, requested);

            try {
                await this.emailSender.send({
                    userId: String(user._id),
                    to,
                    subject: payload.subject,
                    message: payload.message,
                    templateName: variant.templateName,
                    templateData: payload.templateData,
                    contextType: notif.contextType as NotificationContextType,
                    contextId: String(notif.contextId),
                });
                this.emitInApp(user, notif, payload);
                return {
                    sent: true,
                    languageUsed: variant.languageUsed,
                    languageFallbackUsed: variant.fallbackUsed,
                };
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

    private resolveEmailTemplateVariant(baseTemplateName: string, requestedLanguage: string) {
        const normalizedLang = requestedLanguage?.trim() || 'en';
        if (normalizedLang === 'en') {
            return { templateName: baseTemplateName, languageUsed: 'en', fallbackUsed: false };
        }

        const candidateName = `${baseTemplateName}.${normalizedLang}`;
        const candidatePath = join(process.cwd(), 'templates', 'email', `${candidateName}.hbs`);
        if (existsSync(candidatePath)) {
            return {
                templateName: candidateName,
                languageUsed: normalizedLang,
                fallbackUsed: false,
            };
        }

        this.logger.warn(
            `Missing email template "${candidateName}.hbs"; falling back to English ("${baseTemplateName}.hbs")`,
        );
        return { templateName: baseTemplateName, languageUsed: 'en', fallbackUsed: true };
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
