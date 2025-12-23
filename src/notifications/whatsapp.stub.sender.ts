import { Injectable, Logger } from '@nestjs/common';
import {
    NotificationSender,
    SendOptions,
} from '../common/interfaces/notification-sender.interface';

@Injectable()
export class WhatsAppNotificationSender implements NotificationSender {
    private readonly logger = new Logger(WhatsAppNotificationSender.name);

    async send(options: SendOptions): Promise<void> {
        // Stubbed: replace with actual WhatsApp send when provider is ready.
        this.logger.log(
            `WhatsApp send stub to ${options.to} for ${options.contextType}/${options.contextId}: ${options.message}`,
        );
    }
}
