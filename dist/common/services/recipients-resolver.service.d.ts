import { Model } from 'mongoose';
import { Town } from '../enums/activity.enum';
import { SettingsService } from '../../settings/settings.service';
import { UserDocument } from '../../schema/user.schema';
import { MonitorProfileDocument } from '../../schema/monitor-profile.schema';
export interface RecipientContact {
    userId: string;
    email?: string;
    phoneE164?: string;
    preferredLanguage?: string;
    town?: Town;
}
export declare class RecipientsResolverService {
    private readonly userModel;
    private readonly monitorProfileModel;
    private readonly settingsService;
    constructor(userModel: Model<UserDocument>, monitorProfileModel: Model<MonitorProfileDocument>, settingsService: SettingsService);
    resolve(kind: string, town?: Town): Promise<RecipientContact[]>;
}
