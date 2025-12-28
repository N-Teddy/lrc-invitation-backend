import { Injectable, Logger } from '@nestjs/common';
import type { Transporter } from 'nodemailer';
import * as nodemailer from 'nodemailer';
import {
    NotificationSender,
    SendOptions,
} from '../common/interfaces/notification-sender.interface';
import { AppConfigService } from '../config/app-config.service';
import { renderEmailTemplate } from '../common/utils/template.util';
import { SettingsService } from '../settings/settings.service';
import {
    DEFAULT_EMAIL_TEMPLATE_THEME,
    getEmailThemeTokens,
    isEmailTemplateTheme,
} from '../common/constants/email-themes';

@Injectable()
export class EmailNotificationSender implements NotificationSender {
    private readonly logger = new Logger(EmailNotificationSender.name);
    private transporter?: Transporter;

    constructor(
        private readonly config: AppConfigService,
        private readonly settingsService: SettingsService,
    ) {}

    private getTransporter(): Transporter {
        if (this.transporter) return this.transporter;

        const host = this.config.mailHost;
        const port = this.config.mailPort;
        const secure = this.config.mailSecure;
        const requireTLS = this.config.mailRequireTls;
        const ignoreTLS = this.config.mailIgnoreTls;
        const user = this.config.mailUser;
        const pass = this.config.mailPass;

        if (this.config.isProduction) {
            if (!host) {
                this.logger.error('MAIL_HOST is required in production');
            }
            if (!user || !pass) {
                this.logger.error('MAIL_USER and MAIL_PASS are required in production');
            }
        }

        this.transporter = nodemailer.createTransport({
            host,
            port,
            secure,
            requireTLS,
            ignoreTLS,
            auth:
                user && pass
                    ? {
                          user,
                          pass,
                      }
                    : undefined,
            tls: {
                rejectUnauthorized: this.config.mailTlsRejectUnauthorized,
            },
        });

        return this.transporter;
    }

    async send(options: SendOptions): Promise<void> {
        const from = this.config.mailFrom;
        try {
            const transporter = this.getTransporter();
            const subject = options.subject ?? 'Notification';
            const templateName = options.templateName ?? 'generic-notification';
            const templateData =
                options.templateData ??
                ({
                    subject,
                    headline: subject,
                    message: options.message,
                } as Record<string, any>);
            let themeId = DEFAULT_EMAIL_TEMPLATE_THEME;
            try {
                const themeSetting = await this.settingsService.getEmailTemplateTheme();
                if (isEmailTemplateTheme(themeSetting.theme)) {
                    themeId = themeSetting.theme;
                }
            } catch {
                themeId = DEFAULT_EMAIL_TEMPLATE_THEME;
            }
            const theme = getEmailThemeTokens(themeId);

            const payload: Record<string, any> = {
                ...templateData,
                subject: templateData.subject ?? subject,
                headline: templateData.headline ?? subject,
                brandName: templateData.brandName ?? 'LRC Jeunesse',
                theme,
            };

            if (Array.isArray(payload.actions) && payload.actions.length) {
                payload.actionsHtml = payload.actions
                    .map(
                        (a: { url: string; label: string }) =>
                            `<a href="${a.url}" style="display:inline-block;margin:6px 8px 6px 0;background:${theme.primary};color:#fff;padding:10px 16px;text-decoration:none;border-radius:999px;font-weight:600;font-size:12px;">${a.label}</a>`,
                    )
                    .join('');
                if (!payload.actionsText) {
                    payload.actionsText = payload.actions
                        .map((a: { url: string; label: string }) => `${a.label}: ${a.url}`)
                        .join('\n');
                }
                if (payload.actions.length === 1) {
                    payload.actionUrl = payload.actionUrl ?? payload.actions[0].url;
                    payload.actionLabel = payload.actionLabel ?? payload.actions[0].label;
                }
            }

            const html = renderEmailTemplate(templateName, payload);

            await transporter.sendMail({
                from,
                to: options.to,
                subject,
                text: options.message,
                html,
            });
        } catch (err) {
            this.logger.error(`Failed to send email to ${options.to}: ${err?.message ?? err}`);
            throw err;
        }
    }
}
