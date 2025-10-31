import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Activity } from '../../entities/activity.entity';
import { InvitationListService } from 'src/modules/invitations/invitation-list.service';
import { RecipientService } from 'src/modules/invitations/recipient.service';
import { NotificationService } from 'src/modules/invitations/notification.service';

@Injectable()
export class InvitationsCronService {
    private readonly logger = new Logger(InvitationsCronService.name);

    constructor(
        private readonly invitationListService: InvitationListService,
        private readonly recipientService: RecipientService,
        private readonly notificationService: NotificationService,
        @InjectRepository(Activity)
        private activityRepository: Repository<Activity>,
    ) { }

    // Auto-generate and send invitation lists every Monday at 8 AM
    @Cron('0 8 * * 1') // Every Monday at 8:00 AM
    async handleWeeklyInvitationGeneration() {
        this.logger.log('🔔 Running cron job: Weekly invitation list generation');

        try {
            // Calculate date range (2-3 weeks from now)
            const today = new Date();
            const startDate = new Date(today);
            startDate.setDate(today.getDate() + 14); // 2 weeks

            const endDate = new Date(today);
            endDate.setDate(today.getDate() + 21); // 3 weeks

            // Find activities in the range
            const upcomingActivities = await this.activityRepository.find({
                where: {
                    date: Between(
                        startDate.toISOString().split('T')[0],
                        endDate.toISOString().split('T')[0],
                    ) as any,
                },
            });

            if (upcomingActivities.length === 0) {
                this.logger.log('No activities found in the next 2-3 weeks');
                return;
            }

            this.logger.log(`Found ${upcomingActivities.length} activities to process`);

            let totalSent = 0;
            let totalFailed = 0;

            // Process each activity
            for (const activity of upcomingActivities) {
                const result = await this.processActivityInvitationList(activity);
                totalSent += result.sent;
                totalFailed += result.failed;
            }

            this.logger.log(
                `✅ Weekly invitation generation completed: ${totalSent} sent, ${totalFailed} failed`,
            );
        } catch (error) {
            this.logger.error('❌ Error in weekly invitation generation:', error.message);
        }
    }

    // Daily check for activities exactly 2 weeks away (runs at 9 AM)
    @Cron('0 9 * * *')
    async handleDailyCheck() {
        this.logger.debug('🔍 Running daily check for upcoming activities');

        try {
            const today = new Date();
            const twoWeeksFromNow = new Date(today);
            twoWeeksFromNow.setDate(today.getDate() + 14);

            const activities = await this.activityRepository.find({
                where: {
                    date: twoWeeksFromNow.toISOString().split('T')[0] as any,
                },
            });

            if (activities.length > 0) {
                this.logger.log(`Found ${activities.length} activities exactly 2 weeks away`);

                for (const activity of activities) {
                    await this.processActivityInvitationList(activity);
                }
            }
        } catch (error) {
            this.logger.error('❌ Error in daily check:', error.message);
        }
    }

    // Retry failed deliveries every day at 10 AM
    @Cron('0 10 * * *')
    async handleRetryFailedDeliveries() {
        this.logger.log('🔄 Running cron job: Retry failed deliveries');

        try {
            const today = new Date();
            const startDate = new Date(today);
            startDate.setDate(today.getDate() + 7); // 1 week

            const endDate = new Date(today);
            endDate.setDate(today.getDate() + 21); // 3 weeks

            const upcomingActivities = await this.activityRepository.find({
                where: {
                    date: Between(
                        startDate.toISOString().split('T')[0],
                        endDate.toISOString().split('T')[0],
                    ) as any,
                },
            });

            let totalRetried = 0;
            let totalSuccess = 0;

            for (const activity of upcomingActivities) {
                const invitationList = await this.invitationListService.generateInvitationList(
                    activity.id,
                );

                const results = await this.notificationService.retryFailed(
                    activity.id,
                    invitationList,
                );

                if (results.length > 0) {
                    const successCount = results.filter((r) => r.success).length;
                    totalRetried += results.length;
                    totalSuccess += successCount;

                    this.logger.log(
                        `Retried ${results.length} failed deliveries for "${activity.name}": ${successCount} successful`,
                    );
                }
            }

            if (totalRetried > 0) {
                this.logger.log(
                    `✅ Retry completed: ${totalSuccess}/${totalRetried} successful`,
                );
            }
        } catch (error) {
            this.logger.error('❌ Error retrying failed deliveries:', error.message);
        }
    }

    // Clean up old logs every week (Sunday at midnight)
    @Cron('0 0 * * 0')
    async handleCleanupOldLogs() {
        this.logger.log('🧹 Running cron job: Cleanup old logs');

        try {
            const sixMonthsAgo = new Date();
            sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

            const result = await this.notificationService['invitationLogRepository']
                .createQueryBuilder()
                .delete()
                .where('sentAt < :date', { date: sixMonthsAgo })
                .execute();

            this.logger.log(`Cleaned up ${result.affected} old logs`);
        } catch (error) {
            this.logger.error('❌ Error cleaning up logs:', error.message);
        }
    }

    private async processActivityInvitationList(activity: Activity): Promise<{ sent: number; failed: number }> {
        try {
            this.logger.log(`📋 Processing invitation list for: ${activity.name}`);

            // Generate invitation list
            const invitationList = await this.invitationListService.generateInvitationList(
                activity.id,
            );

            if (invitationList.statistics.totalCount === 0) {
                this.logger.warn(`⚠️ No children found for activity: ${activity.name}`);
                return { sent: 0, failed: 0 };
            }

            // Get recipients (check if already configured, otherwise use defaults)
            let recipients = await this.recipientService.getInvitationRecipients(activity.id);

            if (recipients.length === 0) {
                this.logger.log('No recipients configured, using default recipients');
                recipients = await this.recipientService.getDefaultRecipients();

                // Auto-configure default recipients for this activity
                if (recipients.length > 0) {
                    await this.recipientService.setInvitationRecipients(activity.id, {
                        monitorIds: recipients.map((r) => r.id),
                        shouldReceiveWhatsapp: true,
                        shouldReceiveEmail: false,
                    });
                }
            }

            if (recipients.length === 0) {
                this.logger.warn(`⚠️ No recipients available for activity: ${activity.name}`);
                return { sent: 0, failed: 0 };
            }

            // Send invitation lists
            const results = await this.notificationService.sendInvitationList({
                activityId: activity.id,
                invitationList,
                recipients,
                method: 'whatsapp',
            });

            const successCount = results.filter((r) => r.success).length;
            const failCount = results.filter((r) => !r.success).length;

            this.logger.log(
                `✅ Invitation list sent for "${activity.name}": ${successCount} successful, ${failCount} failed`,
            );

            return { sent: successCount, failed: failCount };
        } catch (error) {
            this.logger.error(`❌ Error processing activity ${activity.name}:`, error.message);
            return { sent: 0, failed: 0 };
        }
    }

    // Manual trigger for testing (can be removed in production)
    async manualTrigger() {
        this.logger.log('🔧 Manual trigger initiated');
        await this.handleWeeklyInvitationGeneration();
    }
}
