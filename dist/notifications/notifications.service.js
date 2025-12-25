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
var NotificationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const common_1 = require("@nestjs/common");
const fs_1 = require("fs");
const path_1 = require("path");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const notification_schema_1 = require("../schema/notification.schema");
const notification_enum_1 = require("../common/enums/notification.enum");
const email_sender_1 = require("./email.sender");
const whatsapp_stub_sender_1 = require("./whatsapp.stub.sender");
const notifications_gateway_1 = require("./notifications.gateway");
const app_config_service_1 = require("../config/app-config.service");
const user_schema_1 = require("../schema/user.schema");
const backoff_util_1 = require("../common/utils/backoff.util");
const action_tokens_service_1 = require("../common/services/action-tokens.service");
const conversation_state_service_1 = require("../conversations/conversation-state.service");
const settings_service_1 = require("../settings/settings.service");
let NotificationService = NotificationService_1 = class NotificationService {
    constructor(notificationModel, userModel, emailSender, whatsappSender, notificationsGateway, config, settingsService, actionTokensService, conversationStateService) {
        this.notificationModel = notificationModel;
        this.userModel = userModel;
        this.emailSender = emailSender;
        this.whatsappSender = whatsappSender;
        this.notificationsGateway = notificationsGateway;
        this.config = config;
        this.settingsService = settingsService;
        this.actionTokensService = actionTokensService;
        this.conversationStateService = conversationStateService;
        this.logger = new common_1.Logger(NotificationService_1.name);
    }
    async send(options) {
        const subject = options.subject ?? 'Notification';
        const templateName = options.templateName ?? 'generic-notification';
        const templateData = options.templateData ??
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
            toUserId: new mongoose_2.Types.ObjectId(options.userId),
            contextType: options.contextType,
            contextId: options.contextId,
            status: notification_enum_1.NotificationStatus.Queued,
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
            const expiresAt = options.conversation?.expiresAt ?? new Date(Date.now() + 24 * 60 * 60 * 1000);
            const actionLinks = options.actions.map((a) => {
                const token = this.actionTokensService.sign({
                    typ: 'action',
                    sub: options.userId,
                    notificationId: String(notif._id),
                    contextType: options.contextType,
                    contextId: options.contextId,
                    actionId: a.id,
                    redirectUrl: a.redirectUrl,
                }, expiresAt);
                return {
                    id: a.id,
                    label: a.label,
                    url: `${this.config.apiBaseUrl}/actions/${token}`,
                };
            });
            const actionsHtml = actionLinks
                .map((a) => `<a href="${a.url}" style="display:inline-block;margin:6px 8px 6px 0;background:#2563eb;color:#fff;padding:10px 14px;text-decoration:none;border-radius:8px;">${a.label}</a>`)
                .join('');
            const actionsText = actionLinks.map((a) => `${a.label}: ${a.url}`).join('\n');
            const updatedTemplateData = {
                ...(templateData ?? {}),
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
        try {
            await this.dispatchNotification(String(notif._id));
        }
        catch (err) {
            const attempt = (notif.attempts ?? 0) + 1;
            await this.notificationModel.findByIdAndUpdate(notif._id, {
                status: notification_enum_1.NotificationStatus.Failed,
                error: err?.message ?? String(err),
                nextAttemptAt: new Date(Date.now() + (0, backoff_util_1.computeBackoffMs)(attempt)),
            });
        }
        return notif.toObject();
    }
    async processDueNotifications(now = new Date()) {
        const due = await this.notificationModel
            .find({
            status: { $in: [notification_enum_1.NotificationStatus.Queued, notification_enum_1.NotificationStatus.Failed] },
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
    getPrimaryChannel() {
        return this.config.notificationProvider === 'whatsapp' ? notification_enum_1.Channel.WhatsApp : notification_enum_1.Channel.Email;
    }
    getFallbackChannel(primary) {
        if (primary === notification_enum_1.Channel.WhatsApp) {
            return this.config.notificationFallbackProvider === 'email' ? notification_enum_1.Channel.Email : undefined;
        }
        return undefined;
    }
    isWhatsAppAvailable() {
        return (this.config.whatsAppEnabled &&
            !!this.config.whatsAppAccessToken &&
            !!this.config.whatsAppPhoneNumberId &&
            !!this.config.whatsAppBusinessAccountId);
    }
    async dispatchNotification(notificationId) {
        const notif = await this.notificationModel.findById(notificationId).lean().exec();
        if (!notif)
            return;
        if (notif.status === notification_enum_1.NotificationStatus.Sent)
            return;
        const attempt = (notif.attempts ?? 0) + 1;
        const maxAttempts = notif.maxAttempts ?? 6;
        await this.notificationModel.findByIdAndUpdate(notificationId, {
            $set: { lastAttemptAt: new Date() },
            $inc: { attempts: 1 },
        });
        const user = await this.userModel.findById(notif.toUserId).lean().exec();
        if (!user) {
            await this.notificationModel.findByIdAndUpdate(notificationId, {
                status: notification_enum_1.NotificationStatus.Failed,
                error: 'User not found',
                skipReason: 'user_not_found',
                nextAttemptAt: undefined,
            });
            return;
        }
        const primary = notif.primaryChannel;
        const fallback = this.getFallbackChannel(primary);
        const payload = (notif.payload ?? {});
        const languages = await this.settingsService.getLanguages();
        const requestedLanguage = user.preferredLanguage ?? languages.defaultLanguage ?? 'en';
        payload.templateLanguage = requestedLanguage;
        const sendResult = await this.trySendInOrder([
            { channel: primary, fallbackUsed: false },
            ...(fallback ? [{ channel: fallback, fallbackUsed: true }] : []),
            { channel: notification_enum_1.Channel.InApp, fallbackUsed: true },
        ], user, notif, payload);
        if (sendResult.sent) {
            await this.notificationModel.findByIdAndUpdate(notificationId, {
                status: notification_enum_1.NotificationStatus.Sent,
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
            this.logger.error(`Dead-letter notification ${notificationId} after ${attempt}/${maxAttempts} attempts: ${sendResult.error ?? sendResult.skipReason ?? 'unknown_error'}`);
            await this.notificationModel.findByIdAndUpdate(notificationId, {
                status: notification_enum_1.NotificationStatus.Failed,
                error: sendResult.error ?? 'Notification send failed',
                skipReason: sendResult.skipReason ?? 'max_attempts_reached',
                templateLanguage: requestedLanguage,
                languageUsed: sendResult.languageUsed ?? requestedLanguage,
                languageFallbackUsed: sendResult.languageFallbackUsed ?? false,
                nextAttemptAt: undefined,
            });
            return;
        }
        const delayMs = (0, backoff_util_1.computeBackoffMs)(attempt);
        await this.notificationModel.findByIdAndUpdate(notificationId, {
            status: notification_enum_1.NotificationStatus.Failed,
            error: sendResult.error ?? 'Notification send failed',
            skipReason: sendResult.skipReason,
            templateLanguage: requestedLanguage,
            languageUsed: sendResult.languageUsed ?? requestedLanguage,
            languageFallbackUsed: sendResult.languageFallbackUsed ?? false,
            nextAttemptAt: new Date(Date.now() + delayMs),
        });
    }
    async trySendInOrder(candidates, user, notif, payload) {
        let lastError;
        let languageUsed;
        let languageFallbackUsed;
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
    async trySend(channel, user, notif, payload) {
        if (channel === notification_enum_1.Channel.WhatsApp) {
            if (!this.isWhatsAppAvailable()) {
                return { sent: false, skipReason: 'whatsapp_unavailable' };
            }
            if (user.whatsApp?.optIn === false) {
                return { sent: false, skipReason: 'whatsapp_opt_out' };
            }
            const to = user.whatsApp?.phoneE164;
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
                    contextType: notif.contextType,
                    contextId: String(notif.contextId),
                });
                this.emitInApp(user, notif, payload);
                return { sent: true, languageUsed: payload.templateLanguage };
            }
            catch (err) {
                return { sent: false, error: err?.message ?? String(err) };
            }
        }
        if (channel === notification_enum_1.Channel.Email) {
            const to = user.email;
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
                    contextType: notif.contextType,
                    contextId: String(notif.contextId),
                });
                this.emitInApp(user, notif, payload);
                return {
                    sent: true,
                    languageUsed: variant.languageUsed,
                    languageFallbackUsed: variant.fallbackUsed,
                };
            }
            catch (err) {
                return { sent: false, error: err?.message ?? String(err) };
            }
        }
        if (channel === notification_enum_1.Channel.InApp) {
            if (!this.config.inAppNotificationsEnabled) {
                return { sent: false, skipReason: 'in_app_disabled' };
            }
            try {
                this.emitInApp(user, notif, payload);
                return { sent: true };
            }
            catch (err) {
                return { sent: false, error: err?.message ?? String(err) };
            }
        }
        return { sent: false, skipReason: 'unsupported_channel' };
    }
    resolveEmailTemplateVariant(baseTemplateName, requestedLanguage) {
        const normalizedLang = requestedLanguage?.trim() || 'en';
        if (normalizedLang === 'en') {
            return { templateName: baseTemplateName, languageUsed: 'en', fallbackUsed: false };
        }
        const candidateName = `${baseTemplateName}.${normalizedLang}`;
        const candidatePath = (0, path_1.join)(process.cwd(), 'templates', 'email', `${candidateName}.hbs`);
        if ((0, fs_1.existsSync)(candidatePath)) {
            return {
                templateName: candidateName,
                languageUsed: normalizedLang,
                fallbackUsed: false,
            };
        }
        this.logger.warn(`Missing email template "${candidateName}.hbs"; falling back to English ("${baseTemplateName}.hbs")`);
        return { templateName: baseTemplateName, languageUsed: 'en', fallbackUsed: true };
    }
    emitInApp(user, notif, payload) {
        this.notificationsGateway.emitToUser(String(user._id), 'notification', {
            notificationId: String(notif._id),
            contextType: notif.contextType,
            contextId: notif.contextId,
            title: payload.subject ?? 'Notification',
            message: payload.message,
            channelUsed: notif.channelUsed ?? notif.primaryChannel,
        });
    }
};
exports.NotificationService = NotificationService;
exports.NotificationService = NotificationService = NotificationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(notification_schema_1.Notification.name)),
    __param(1, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        email_sender_1.EmailNotificationSender,
        whatsapp_stub_sender_1.WhatsAppNotificationSender,
        notifications_gateway_1.NotificationsGateway,
        app_config_service_1.AppConfigService,
        settings_service_1.SettingsService,
        action_tokens_service_1.ActionTokensService,
        conversation_state_service_1.ConversationStateService])
], NotificationService);
//# sourceMappingURL=notifications.service.js.map