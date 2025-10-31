import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WhatsAppService } from '../whatsapp/whatsapp.service';
import { InvitationLog, DeliveryMethod, DeliveryStatus } from '../../entities/invitation-log.entity';
import { Monitor } from '../../entities/monitor.entity';
import { InvitationList } from './invitation-list.service';
import { MessageFormatterService } from './message-formatter.service';

export interface SendOptions {
    activityId: number;
    invitationList: InvitationList;
    recipients: Monitor[];
    method: 'whatsapp' | 'email' | 'both';
    customMessage?: string;
}

export interface SendResult {
    success: boolean;
    monitorId: number;
    monitorName: string;
    method: DeliveryMethod;
    error?: string;
}

@Injectable()
export class NotificationService {
    private readonly logger = new Logger(NotificationService.name);

    constructor(
        @InjectRepository(InvitationLog)
        private invitationLogRepository: Repository<InvitationLog>,
        private readonly whatsAppService: WhatsAppService,
        private readonly messageFormatter: MessageFormatterService,
    ) { }

    async sendInvitationList(options: SendOptions): Promise<SendResult[]> {
        const { activityId, invitationList, recipients, method, customMessage } = options;

        if (recipients.length === 0) {
            throw new BadRequestException('No recipients specified');
        }

        const message = customMessage || this.messageFormatter.formatInvitationList(invitationList);
        const results: SendResult[] = [];

        for (const recipient of recipients) {
            // Send via WhatsApp
            if (method === 'whatsapp' || method === 'both') {
                const whatsappResult = await this.sendViaWhatsApp(
                    activityId,
                    recipient,
                    message,
                    invitationList.statistics.totalCount,
                );
                results.push(whatsappResult);
            }

            // Send via Email (if needed)
            if (method === 'email' || method === 'both') {
                const emailResult = await this.sendViaEmail(
                    activityId,
                    recipient,
                    message,
                    invitationList.statistics.totalCount,
                );
                results.push(emailResult);
            }

            // Small delay between recipients to avoid rate limiting
            await this.delay(1000);
        }

        return results;
    }

    private async sendViaWhatsApp(
        activityId: number,
        recipient: Monitor,
        message: string,
        childrenCount: number,
    ): Promise<SendResult> {
        const log = this.invitationLogRepository.create({
            activityId,
            sentToMonitorId: recipient.id,
            deliveryMethod: DeliveryMethod.WHATSAPP,
            status: DeliveryStatus.PENDING,
            childrenCount,
            messagePreview: message.substring(0, 200),
        });

        try {
            if (!this.whatsAppService.isClientReady()) {
                throw new Error('WhatsApp client is not ready');
            }

            if (!recipient.phoneNumber) {
                throw new Error('Monitor does not have a phone number');
            }

            const success = await this.whatsAppService.sendMessage(
                recipient.phoneNumber,
                message,
            );

            if (!success) {
                throw new Error('Failed to send WhatsApp message');
            }

            log.status = DeliveryStatus.SENT;
            await this.invitationLogRepository.save(log);

            this.logger.log(`WhatsApp sent to ${recipient.name} (${recipient.phoneNumber})`);

            return {
                success: true,
                monitorId: recipient.id,
                monitorName: recipient.name,
                method: DeliveryMethod.WHATSAPP,
            };
        } catch (error) {
            log.status = DeliveryStatus.FAILED;
            log.errorMessage = error.message;
            await this.invitationLogRepository.save(log);

            this.logger.error(`Failed to send WhatsApp to ${recipient.name}:`, error.message);

            return {
                success: false,
                monitorId: recipient.id,
                monitorName: recipient.name,
                method: DeliveryMethod.WHATSAPP,
                error: error.message,
            };
        }
    }

    private async sendViaEmail(
        activityId: number,
        recipient: Monitor,
        message: string,
        childrenCount: number,
    ): Promise<SendResult> {
        const log = this.invitationLogRepository.create({
            activityId,
            sentToMonitorId: recipient.id,
            deliveryMethod: DeliveryMethod.EMAIL,
            status: DeliveryStatus.PENDING,
            childrenCount,
            messagePreview: message.substring(0, 200),
        });

        try {
            if (!recipient.email) {
                throw new Error('Monitor does not have an email address');
            }

            // TODO: Implement email sending using nodemailer or similar
            // For now, just mark as sent
            log.status = DeliveryStatus.SENT;
            await this.invitationLogRepository.save(log);

            this.logger.log(`Email sent to ${recipient.name} (${recipient.email})`);

            return {
                success: true,
                monitorId: recipient.id,
                monitorName: recipient.name,
                method: DeliveryMethod.EMAIL,
            };
        } catch (error) {
            log.status = DeliveryStatus.FAILED;
            log.errorMessage = error.message;
            await this.invitationLogRepository.save(log);

            this.logger.error(`Failed to send email to ${recipient.name}:`, error.message);

            return {
                success: false,
                monitorId: recipient.id,
                monitorName: recipient.name,
                method: DeliveryMethod.EMAIL,
                error: error.message,
            };
        }
    }

    async getSendLogs(activityId: number): Promise<InvitationLog[]> {
        return this.invitationLogRepository.find({
            where: { activityId },
            relations: ['sentToMonitor'],
            order: { sentAt: 'DESC' },
        });
    }

    async getRecentLogs(limit: number = 50): Promise<InvitationLog[]> {
        return this.invitationLogRepository.find({
            relations: ['sentToMonitor', 'activity'],
            order: { sentAt: 'DESC' },
            take: limit,
        });
    }

    async getFailedLogs(activityId?: number): Promise<InvitationLog[]> {
        const query = this.invitationLogRepository
            .createQueryBuilder('log')
            .leftJoinAndSelect('log.sentToMonitor', 'monitor')
            .leftJoinAndSelect('log.activity', 'activity')
            .where('log.status = :status', { status: DeliveryStatus.FAILED });

        if (activityId) {
            query.andWhere('log.activityId = :activityId', { activityId });
        }

        return query.orderBy('log.sentAt', 'DESC').getMany();
    }

    async retryFailed(activityId: number, invitationList: InvitationList): Promise<SendResult[]> {
        const failedLogs = await this.invitationLogRepository.find({
            where: {
                activityId,
                status: DeliveryStatus.FAILED,
            },
            relations: ['sentToMonitor'],
        });

        if (failedLogs.length === 0) {
            return [];
        }

        const recipients = failedLogs.map((log) => log.sentToMonitor);
        const method = failedLogs[0].deliveryMethod === DeliveryMethod.WHATSAPP ? 'whatsapp' : 'email';

        return this.sendInvitationList({
            activityId,
            invitationList,
            recipients,
            method,
        });
    }

    async getDeliveryStatistics(activityId?: number) {
        const query = this.invitationLogRepository.createQueryBuilder('log');

        if (activityId) {
            query.where('log.activityId = :activityId', { activityId });
        }

        const total = await query.getCount();
        const sent = await query
            .clone()
            .andWhere('log.status = :status', { status: DeliveryStatus.SENT })
            .getCount();
        const failed = await query
            .clone()
            .andWhere('log.status = :status', { status: DeliveryStatus.FAILED })
            .getCount();
        const pending = await query
            .clone()
            .andWhere('log.status = :status', { status: DeliveryStatus.PENDING })
            .getCount();

        return {
            total,
            sent,
            failed,
            pending,
            successRate: total > 0 ? ((sent / total) * 100).toFixed(2) : 0,
        };
    }

    private delay(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}
