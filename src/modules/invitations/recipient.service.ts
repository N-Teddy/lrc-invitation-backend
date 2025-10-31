import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { InvitationRecipient } from '../../entities/invitation-recipient.entity';
import { Monitor } from '../../entities/monitor.entity';
import { Activity } from '../../entities/activity.entity';
import { Role } from 'src/common/enums/role.enum';
import { BulkRecipientsDto, SetRecipientsDto } from 'src/dto/request/invitation-recepient.dto';

@Injectable()
export class RecipientService {
    constructor(
        @InjectRepository(InvitationRecipient)
        private recipientRepository: Repository<InvitationRecipient>,
        @InjectRepository(Monitor)
        private monitorRepository: Repository<Monitor>,
        @InjectRepository(Activity)
        private activityRepository: Repository<Activity>,
    ) { }

    async getInvitationRecipients(activityId: number): Promise<Monitor[]> {
        const recipients = await this.recipientRepository.find({
            where: { activityId },
            relations: ['monitor'],
        });

        return recipients.map((r) => r.monitor);
    }

    async getRecipientsWithPreferences(activityId: number) {
        const recipients = await this.recipientRepository.find({
            where: { activityId },
            relations: ['monitor'],
        });

        return recipients.map((r) => ({
            monitor: r.monitor,
            shouldReceiveWhatsapp: r.shouldReceiveWhatsapp,
            shouldReceiveEmail: r.shouldReceiveEmail,
        }));
    }

    async setInvitationRecipients(
        activityId: number,
        setRecipientsDto: SetRecipientsDto,
    ): Promise<InvitationRecipient[]> {
        // Verify activity exists
        const activity = await this.activityRepository.findOne({
            where: { id: activityId },
        });

        if (!activity) {
            throw new NotFoundException(`Activity with ID ${activityId} not found`);
        }

        // Verify all monitors exist
        const monitors = await this.monitorRepository.find({
            where: { id: In(setRecipientsDto.monitorIds) },
        });

        if (monitors.length !== setRecipientsDto.monitorIds.length) {
            throw new NotFoundException('Some monitor IDs are invalid');
        }

        // Remove existing recipients
        await this.recipientRepository.delete({ activityId });

        // Create new recipients
        const recipients = setRecipientsDto.monitorIds.map((monitorId) =>
            this.recipientRepository.create({
                activityId,
                monitorId,
                shouldReceiveWhatsapp: setRecipientsDto.shouldReceiveWhatsapp ?? true,
                shouldReceiveEmail: setRecipientsDto.shouldReceiveEmail ?? false,
            }),
        );

        return this.recipientRepository.save(recipients);
    }

    async setBulkRecipients(bulkRecipientsDto: BulkRecipientsDto) {
        const results = [];

        for (const activityRecipient of bulkRecipientsDto.activities) {
            const recipients = await this.setInvitationRecipients(
                activityRecipient.activityId,
                {
                    monitorIds: activityRecipient.monitorIds,
                    shouldReceiveWhatsapp: bulkRecipientsDto.shouldReceiveWhatsapp,
                    shouldReceiveEmail: bulkRecipientsDto.shouldReceiveEmail,
                },
            );

            results.push({
                activityId: activityRecipient.activityId,
                recipientsCount: recipients.length,
            });
        }

        return results;
    }

    async addRecipient(
        activityId: number,
        monitorId: number,
        shouldReceiveWhatsapp: boolean = true,
        shouldReceiveEmail: boolean = false,
    ): Promise<InvitationRecipient> {
        // Check if already exists
        const existing = await this.recipientRepository.findOne({
            where: { activityId, monitorId },
        });

        if (existing) {
            throw new ConflictException('Recipient already exists for this activity');
        }

        // Verify monitor exists
        const monitor = await this.monitorRepository.findOne({
            where: { id: monitorId },
        });

        if (!monitor) {
            throw new NotFoundException(`Monitor with ID ${monitorId} not found`);
        }

        // Verify activity exists
        const activity = await this.activityRepository.findOne({
            where: { id: activityId },
        });

        if (!activity) {
            throw new NotFoundException(`Activity with ID ${activityId} not found`);
        }

        const recipient = this.recipientRepository.create({
            activityId,
            monitorId,
            shouldReceiveWhatsapp,
            shouldReceiveEmail,
        });

        return this.recipientRepository.save(recipient);
    }

    async removeRecipient(activityId: number, monitorId: number): Promise<void> {
        const recipient = await this.recipientRepository.findOne({
            where: { activityId, monitorId },
        });

        if (!recipient) {
            throw new NotFoundException('Recipient not found');
        }

        await this.recipientRepository.remove(recipient);
    }

    async getDefaultRecipients(): Promise<Monitor[]> {
        // Get all chief monitors and admins
        return this.monitorRepository.find({
            where: [
                { role: Role.CHIEF_MONITOR, active: true },
                { role: Role.ADMIN, active: true },
            ],
        });
    }

    async getRecipientsByRegion(region: string): Promise<Monitor[]> {
        return this.monitorRepository.find({
            where: {
                region: region as any,
                active: true,
            },
        });
    }

    async updateRecipientPreferences(
        activityId: number,
        monitorId: number,
        shouldReceiveWhatsapp?: boolean,
        shouldReceiveEmail?: boolean,
    ): Promise<InvitationRecipient> {
        const recipient = await this.recipientRepository.findOne({
            where: { activityId, monitorId },
        });

        if (!recipient) {
            throw new NotFoundException('Recipient not found');
        }

        if (shouldReceiveWhatsapp !== undefined) {
            recipient.shouldReceiveWhatsapp = shouldReceiveWhatsapp;
        }

        if (shouldReceiveEmail !== undefined) {
            recipient.shouldReceiveEmail = shouldReceiveEmail;
        }

        return this.recipientRepository.save(recipient);
    }
}
