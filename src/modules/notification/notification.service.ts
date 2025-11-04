import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationLog } from '../../entities/notification-log.entity';
import { Monitor } from '../../entities/monitor.entity';
import { EmailService } from './email.service';
import { WhatsAppService } from './whatsapp.service';
import { NotificationChannel } from '../../common/enums/notification-channel.enum';
import { NotificationStatus } from '../../common/enums/notification-status.enum';
import { RecipientType } from '../../common/enums/recipient-type.enum';
import { ParticipantListResponse } from '../../response/participant.response';

@Injectable()
export class NotificationService {
	constructor(
		@InjectRepository(NotificationLog)
		private notificationLogRepository: Repository<NotificationLog>,
		@InjectRepository(Monitor)
		private monitorRepository: Repository<Monitor>,
		private emailService: EmailService,
		private whatsappService: WhatsAppService
	) {}

	async sendParticipantListNotifications(
		activityId: string,
		participantList: ParticipantListResponse,
		channel: NotificationChannel,
		townId: string
	): Promise<void> {
		// Get all monitors for the town
		const monitors = await this.monitorRepository.find({
			where: { townId, isActive: true },
		});

		for (const monitor of monitors) {
			await this.sendParticipantListToMonitor(monitor, activityId, participantList, channel);
		}
	}

	private async sendParticipantListToMonitor(
		monitor: Monitor,
		activityId: string,
		participantList: ParticipantListResponse,
		channel: NotificationChannel
	): Promise<void> {
		const log = this.notificationLogRepository.create({
			activityId,
			recipientType: RecipientType.MONITOR,
			recipientId: monitor.id,
			recipientEmail: monitor.email,
			recipientWhatsapp: monitor.whatsappNumber,
			channel,
			status: NotificationStatus.PENDING,
		});

		try {
			if (channel === NotificationChannel.EMAIL || channel === NotificationChannel.BOTH) {
				await this.emailService.sendParticipantListEmail(
					monitor.email,
					participantList.activityTitle,
					participantList.participants
				);
			}

			if (channel === NotificationChannel.WHATSAPP || channel === NotificationChannel.BOTH) {
				if (monitor.whatsappNumber && this.whatsappService.isClientReady()) {
					await this.whatsappService.sendParticipantListMessage(
						monitor.whatsappNumber,
						participantList.activityTitle,
						participantList.participants
					);
				}
			}

			log.status = NotificationStatus.SENT;
			log.sentAt = new Date();
		} catch (error) {
			log.status = NotificationStatus.FAILED;
			log.errorMessage = error.message;
		}

		await this.notificationLogRepository.save(log);
	}

	async sendAttendanceEditNotification(monitor: Monitor, message: string): Promise<void> {
		const log = this.notificationLogRepository.create({
			recipientType: RecipientType.MONITOR,
			recipientId: monitor.id,
			recipientEmail: monitor.email,
			channel: NotificationChannel.EMAIL,
			status: NotificationStatus.PENDING,
			message,
		});

		try {
			await this.emailService.sendEmail(
				monitor.email,
				'Attendance Record Edited',
				`<p>${message.replace(/\n/g, '<br>')}</p>`
			);

			log.status = NotificationStatus.SENT;
			log.sentAt = new Date();
		} catch (error) {
			log.status = NotificationStatus.FAILED;
			log.errorMessage = error.message;
		}

		await this.notificationLogRepository.save(log);
	}

	async sendAgeGroupTransitionNotification(
		monitors: Monitor[],
		childName: string,
		oldGroup: string,
		newGroup: string
	): Promise<void> {
		const message = `Child ${childName} has been transitioned from ${oldGroup} to ${newGroup}.`;

		for (const monitor of monitors) {
			const log = this.notificationLogRepository.create({
				recipientType: RecipientType.MONITOR,
				recipientId: monitor.id,
				recipientEmail: monitor.email,
				channel: NotificationChannel.EMAIL,
				status: NotificationStatus.PENDING,
				message,
			});

			try {
				await this.emailService.sendEmail(
					monitor.email,
					'Age Group Transition',
					`<p>${message}</p>`
				);

				log.status = NotificationStatus.SENT;
				log.sentAt = new Date();
			} catch (error) {
				log.status = NotificationStatus.FAILED;
				log.errorMessage = error.message;
			}

			await this.notificationLogRepository.save(log);
		}
	}

	async sendActivityReminder(
		activityId: string,
		activityTitle: string,
		activityDate: Date,
		monitors: Monitor[]
	): Promise<void> {
		const message = `Reminder: ${activityTitle} is scheduled for ${activityDate.toLocaleDateString()}.`;

		for (const monitor of monitors) {
			const log = this.notificationLogRepository.create({
				activityId,
				recipientType: RecipientType.MONITOR,
				recipientId: monitor.id,
				recipientEmail: monitor.email,
				recipientWhatsapp: monitor.whatsappNumber,
				channel: NotificationChannel.BOTH,
				status: NotificationStatus.PENDING,
				message,
			});

			try {
				await this.emailService.sendEmail(
					monitor.email,
					`Activity Reminder - ${activityTitle}`,
					`<p>${message}</p>`
				);

				if (monitor.whatsappNumber && this.whatsappService.isClientReady()) {
					await this.whatsappService.sendMessage(monitor.whatsappNumber, message);
				}

				log.status = NotificationStatus.SENT;
				log.sentAt = new Date();
			} catch (error) {
				log.status = NotificationStatus.FAILED;
				log.errorMessage = error.message;
			}

			await this.notificationLogRepository.save(log);
		}
	}
}
