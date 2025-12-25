import { ChildGroup, Town } from '../../common/enums/activity.enum';
import { ClassificationLabel } from '../../common/enums/attendance.enum';
import { RecipientSelectorType } from '../../common/enums/settings.enum';
export declare class AgeBandRequestDto {
    group: ChildGroup;
    minAgeYears: number;
    maxAgeYears: number;
}
export declare class SetAgeToGroupMappingRequestDto {
    bands: AgeBandRequestDto[];
}
export declare class SetClassificationLabelsRequestDto {
    labels: ClassificationLabel[];
}
export declare class SetLanguagesRequestDto {
    supportedLanguages: string[];
    defaultLanguage: string;
}
export declare class RecipientSelectorRequestDto {
    type: RecipientSelectorType;
    userIds?: string[];
}
export declare class NotificationRecipientsRuleRequestDto {
    kind: string;
    town?: Town;
    selectors: RecipientSelectorRequestDto[];
}
export declare class SetNotificationRecipientsRequestDto {
    rules: NotificationRecipientsRuleRequestDto[];
}
export declare class SetMediaStorageRequestDto {
    providerHint?: 'local' | 'cloudinary';
    maxSizeBytes?: number;
    allowedMimeTypes?: string[];
}
