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
    private readonly transporter: Transporter;

    constructor(private readonly config: AppConfigService) {
        this.transporter = nodemailer.createTransport({
            host: this.config.mailHost,
            port: this.config.mailPort,
            secure: false,
            auth:
                this.config.mailUser && this.config.mailPass
                    ? {
                          user: this.config.mailUser,
                          pass: this.config.mailPass,
                      }
                    : undefined,
        });
    }

    async send(options: SendOptions): Promise<void> {
        const from = this.config.mailFrom;
        try {
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

            await this.transporter.sendMail({
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
