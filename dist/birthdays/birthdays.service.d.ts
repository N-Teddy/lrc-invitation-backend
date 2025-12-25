import { Model } from 'mongoose';
import { AppConfigService } from '../config/app-config.service';
import { JobRunsService } from '../jobs/job-runs.service';
import { NotificationService } from '../notifications/notifications.service';
import { UserDocument } from '../schema/user.schema';
import { RecipientsResolverService } from '../common/services/recipients-resolver.service';
export declare class BirthdaysService {
    private readonly userModel;
    private readonly notificationService;
    private readonly recipientsResolver;
    private readonly jobRuns;
    private readonly config;
    private readonly logger;
    constructor(userModel: Model<UserDocument>, notificationService: NotificationService, recipientsResolver: RecipientsResolverService, jobRuns: JobRunsService, config: AppConfigService);
    runDaily(now?: Date): Promise<void>;
    sendLookahead(days: number, now?: Date): Promise<void>;
    sendMonthlyList(now?: Date): Promise<void>;
    private sendBirthdayMessage;
    private getUpcomingMonthDays;
    private findBirthdays;
    private findBirthdaysForMonth;
    private renderGroupedByTown;
}
