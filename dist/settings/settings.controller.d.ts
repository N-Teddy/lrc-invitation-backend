import { SetAgeToGroupMappingRequestDto, SetClassificationLabelsRequestDto, SetLanguagesRequestDto, SetMediaStorageRequestDto, SetNotificationRecipientsRequestDto } from '../dtos/request/settings.dto';
import { SettingsService } from './settings.service';
export declare class SettingsController {
    private readonly settingsService;
    constructor(settingsService: SettingsService);
    getAgeToGroupMapping(): Promise<{
        bands: import("../common/constants/groups.constants").AgeBand[];
    }>;
    setAgeToGroupMapping(dto: SetAgeToGroupMappingRequestDto): Promise<{
        bands: import("../common/constants/groups.constants").AgeBand[];
    }>;
    getClassificationLabels(): Promise<{
        labels: import("../common/enums/attendance.enum").ClassificationLabel[];
    }>;
    setClassificationLabels(dto: SetClassificationLabelsRequestDto): Promise<{
        labels: import("../common/enums/attendance.enum").ClassificationLabel[];
    }>;
    getLanguages(): Promise<{
        supportedLanguages: string[];
        defaultLanguage: string;
    }>;
    setLanguages(dto: SetLanguagesRequestDto): Promise<{
        supportedLanguages: string[];
        defaultLanguage: string;
    }>;
    getNotificationRecipients(): Promise<import("../common/interfaces/notification-recipients.interface").NotificationRecipientsSettings>;
    setNotificationRecipients(dto: SetNotificationRecipientsRequestDto): Promise<{
        rules: import("../common/interfaces/notification-recipients.interface").NotificationRecipientsSettingsRule[];
    }>;
    getMediaStorage(): Promise<import("../common/interfaces/media-storage-settings.interface").MediaStorageSettings>;
    setMediaStorage(dto: SetMediaStorageRequestDto): Promise<import("../common/interfaces/media-storage-settings.interface").MediaStorageSettings>;
}
