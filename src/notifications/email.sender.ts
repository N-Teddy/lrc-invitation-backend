import { Injectable, Logger } from '@nestjs/common';
import type { Transporter } from 'nodemailer';
import { NotificationSender, SendOptions } from 'src/common/interfaces/notification-sender.interface';

@Injectable()
export class EmailNotificationSender implements NotificationSender {
    private readonly logger = new Logger(EmailNotificationSender.name);
    private transporter?: Transporter;

    constructor() {
        import('nodemailer')
            .then((nodemailer) => {
                this.transporter = nodemailer.createTransport({
                    host: process.env.MAIL_HOST ?? 'localhost',
                    port: Number(process.env.MAIL_PORT ?? 1025),
                    secure: false,
                    auth:
                        process.env.MAIL_USER && process.env.MAIL_PASS
                            ? {
                                user: process.env.MAIL_USER,
                                pass: process.env.MAIL_PASS,
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
        const from = process.env.MAIL_FROM ?? 'LRC Jeunesse <no-reply@lrc-jeunesse.local>';
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
