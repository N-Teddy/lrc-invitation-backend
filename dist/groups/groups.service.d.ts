import { Model } from 'mongoose';
import { NotificationService } from '../notifications/notifications.service';
import { UserDocument } from '../schema/user.schema';
import { ChildProfileDocument } from '../schema/child-profile.schema';
import { MonitorProfileDocument } from '../schema/monitor-profile.schema';
import { ReminderDocument } from '../schema/reminder.schema';
import { AgeBand } from '../common/constants/groups.constants';
import { AppConfigService } from '../config/app-config.service';
import { SettingsService } from '../settings/settings.service';
import { RecipientsResolverService } from '../common/services/recipients-resolver.service';
export declare class GroupsService {
    private readonly userModel;
    private readonly childProfileModel;
    private readonly monitorProfileModel;
    private readonly reminderModel;
    private readonly notificationService;
    private readonly config;
    private readonly settingsService;
    private readonly recipientsResolver;
    private readonly logger;
    constructor(userModel: Model<UserDocument>, childProfileModel: Model<ChildProfileDocument>, monitorProfileModel: Model<MonitorProfileDocument>, reminderModel: Model<ReminderDocument>, notificationService: NotificationService, config: AppConfigService, settingsService: SettingsService, recipientsResolver: RecipientsResolverService);
    getAgeToGroupMapping(): Promise<{
        bands: AgeBand[];
    }>;
    recomputeAllChildren(asOf?: Date): Promise<{
        processedChildren: number;
        updatedGroups: number;
        archivedAdults: number;
        remindersCreated: number;
    }>;
    private createAndSendGroupChangeReminder;
}
