import { Injectable, Logger } from '@nestjs/common';
import type { Transporter } from 'nodemailer';
import * as nodemailer from 'nodemailer';
import {
    NotificationSender,
    SendOptions,
} from '../common/interfaces/notification-sender.interface';
import { AppConfigService } from '../config/app-config.service';
import { renderEmailTemplate } from '../common/utils/template.util';

@Injectable()
export class EmailNotificationSender implements NotificationSender {
    private readonly logger = new Logger(EmailNotificationSender.name);
    private transporter?: Transporter;

    constructor(private readonly config: AppConfigService) {}

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
            const html = renderEmailTemplate(templateName, templateData);

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
