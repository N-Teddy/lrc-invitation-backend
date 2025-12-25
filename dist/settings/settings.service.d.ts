import { OnModuleInit } from '@nestjs/common';
import { Model } from 'mongoose';
import { SettingsDocument } from '../schema/settings.schema';
import { AgeBand } from '../common/constants/groups.constants';
import { ClassificationLabel } from '../common/enums/attendance.enum';
import { AppConfigService } from '../config/app-config.service';
import { MediaStorageSettings } from '../common/interfaces/media-storage-settings.interface';
import { NotificationRecipientsSettings, NotificationRecipientsSettingsRule } from '../common/interfaces/notification-recipients.interface';
export declare class SettingsService implements OnModuleInit {
    private readonly settingsModel;
    private readonly config;
    private readonly logger;
    constructor(settingsModel: Model<SettingsDocument>, config: AppConfigService);
    onModuleInit(): Promise<void>;
    getAgeToGroupMapping(): Promise<{
        bands: AgeBand[];
    }>;
    setAgeToGroupMapping(bands: AgeBand[]): Promise<{
        bands: AgeBand[];
    }>;
    getClassificationLabels(): Promise<{
        labels: ClassificationLabel[];
    }>;
    setClassificationLabels(labels: ClassificationLabel[]): Promise<{
        labels: ClassificationLabel[];
    }>;
    getLanguages(): Promise<{
        supportedLanguages: string[];
        defaultLanguage: string;
    }>;
    setLanguages(supportedLanguages: string[], defaultLanguage: string): Promise<{
        supportedLanguages: string[];
        defaultLanguage: string;
    }>;
    getNotificationRecipients(): Promise<NotificationRecipientsSettings>;
    setNotificationRecipients(rules: NotificationRecipientsSettingsRule[]): Promise<{
        rules: NotificationRecipientsSettingsRule[];
    }>;
    getMediaStorageSettings(): Promise<MediaStorageSettings>;
    setMediaStorageSettings(settings: MediaStorageSettings): Promise<MediaStorageSettings>;
    private getValue;
    private setValue;
    private ensureDefaults;
    private validateAgeBands;
}
