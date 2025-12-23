import { Injectable, Logger } from '@nestjs/common';
import nodemailer, { Transporter } from 'nodemailer';
import { NotificationSender, SendOptions } from './notification-sender.interface';

@Injectable()
export class EmailNotificationSender implements NotificationSender {
    private readonly logger = new Logger(EmailNotificationSender.name);
    private transporter: Transporter;

    constructor() {
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
    }

    async send(options: SendOptions): Promise<void> {
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
