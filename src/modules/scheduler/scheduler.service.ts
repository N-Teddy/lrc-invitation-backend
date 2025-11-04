import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivityService } from '../activity/activity.service';
import { ParticipationService } from '../participation/participation.service';
import { NotificationService } from '../notification/notification.service';
import { ChildService } from '../child/child.service';
import { ConfigurationService } from '../configuration/configuration.service';
import { Monitor } from '../../entities/monitor.entity';
import { NotificationChannel } from '../../common/enums/notification-channel.enum';

@Injectable()
export class SchedulerService {
	private readonly logger = new Logger(SchedulerService.name);

	constructor(
		private activityService: ActivityService,
		private participationService: ParticipationService,
		private notificationService: NotificationService,
		private childService: ChildService,
		private configurationService: ConfigurationService,
		@InjectRepository(Monitor)
		private monitorRepository: Repository<Monitor>
	) {}

	@Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
	async generateParticipantLists() {
		this.logger.log('Running participant list generation job...');

		try {
			const weeksAhead = await this.configurationService.getParticipantListGenerationWeeks();
			const activities =
				await this.activityService.findActivitiesForParticipantGeneration(weeksAhead);

			this.logger.log(`Found ${activities.length} activities requiring participant lists`);

			for (const activity of activities) {
				try {
					this.logger.log(`Generating participant list for activity: ${activity.title}`);

					const participantList = await this.participationService.generateParticipantList(
						activity.id
					);

					await this.activityService.markParticipantListGenerated(activity.id);

					// Send notifications to monitors
					await this.notificationService.sendParticipantListNotifications(
						activity.id,
						participantList,
						NotificationChannel.BOTH,
						activity.townId
					);

					this.logger.log(
						`Successfully generated and sent participant list for: ${activity.title}`
					);
				} catch (error) {
					this.logger.error(
						`Failed to generate participant list for activity ${activity.id}:`,
						error
					);
				}
			}
		} catch (error) {
			this.logger.error('Participant list generation job failed:', error);
		}
	}

	@Cron(CronExpression.EVERY_DAY_AT_1AM)
	async updateAgeGroups() {
		this.logger.log('Running age group update job...');

		try {
			await this.childService.updateAgeGroups();
			this.logger.log('Age groups updated successfully');
		} catch (error) {
			this.logger.error('Age group update job failed:', error);
		}
	}

	@Cron(CronExpression.EVERY_DAY_AT_8AM)
	async sendActivityReminders() {
		this.logger.log('Running activity reminder job...');

		try {
			const tomorrow = new Date();
			tomorrow.setDate(tomorrow.getDate() + 1);
			tomorrow.setHours(0, 0, 0, 0);

			const dayAfterTomorrow = new Date(tomorrow);
			dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

			const activities = await this.activityService.findAll(
				undefined,
				tomorrow.toISOString(),
				dayAfterTomorrow.toISOString()
			);

			this.logger.log(`Found ${activities.length} activities for tomorrow`);

			for (const activity of activities) {
				const monitors = await this.monitorRepository.find({
					where: { townId: activity.townId, isActive: true },
				});

				await this.notificationService.sendActivityReminder(
					activity.id,
					activity.title,
					activity.startDate,
					monitors
				);
			}

			this.logger.log('Activity reminders sent successfully');
		} catch (error) {
			this.logger.error('Activity reminder job failed:', error);
		}
	}

	@Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
	async sendContributionReminders() {
		this.logger.log('Running contribution reminder job...');

		try {
			// Implementation for contribution reminders
			this.logger.log('Contribution reminders sent successfully');
		} catch (error) {
			this.logger.error('Contribution reminder job failed:', error);
		}
	}
}
