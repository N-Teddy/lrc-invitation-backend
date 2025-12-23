import { Injectable, Logger } from '@nestjs/common';
import type { Transporter } from 'nodemailer';
import {
    NotificationSender,
    SendOptions,
} from '../common/interfaces/notification-sender.interface';
import { AppConfigService } from '../config/app-config.service';

@Injectable()
export class EmailNotificationSender implements NotificationSender {
    private readonly logger = new Logger(EmailNotificationSender.name);
    private transporter?: Transporter;

    constructor(private readonly config: AppConfigService) {
        import('nodemailer')
            .then((nodemailer) => {
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
            })
            .catch(() => {
                this.logger.warn(
                    'Nodemailer not available; email notifications will fail until dependencies are installed.',
                );
                this.transporter = undefined;
            });
    }

    async send(options: SendOptions): Promise<void> {
        if (!this.transporter) {
            throw new Error(
                'Email transport not configured; install nodemailer and set MAIL_* envs.',
            );
        }
        const from = this.config.mailFrom;
        try {
            await this.transporter.sendMail({
                from,
                to: options.to,
                subject: options.subject ?? 'Notification',
                text: options.message,
            });
        } catch (err) {
            this.logger.error(`Failed to send email to ${options.to}: ${err?.message ?? err}`);
            throw err;
        }
    }
}
