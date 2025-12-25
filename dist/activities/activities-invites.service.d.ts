import { Model } from 'mongoose';
import { AppConfigService } from '../config/app-config.service';
import { JobRunsService } from '../jobs/job-runs.service';
import { NotificationService } from '../notifications/notifications.service';
import { ActivityDocument } from '../schema/activity.schema';
import { UserDocument } from '../schema/user.schema';
import { RecipientsResolverService } from '../common/services/recipients-resolver.service';
import { ActivitiesService } from './activities.service';
export declare class ActivitiesInvitesService {
    private readonly activityModel;
    private readonly userModel;
    private readonly activitiesService;
    private readonly notificationService;
    private readonly recipientsResolver;
    private readonly jobRuns;
    private readonly config;
    private readonly logger;
    constructor(activityModel: Model<ActivityDocument>, userModel: Model<UserDocument>, activitiesService: ActivitiesService, notificationService: NotificationService, recipientsResolver: RecipientsResolverService, jobRuns: JobRunsService, config: AppConfigService);
    runDaily(now?: Date): Promise<void>;
    private sendInviteSummary;
}
