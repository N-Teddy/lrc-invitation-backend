import { ChildGroup, Town } from '../../common/enums/activity.enum';
import { ClassificationLabel } from '../../common/enums/attendance.enum';
export declare class AgeBandResponseDto {
    group: ChildGroup;
    minAgeYears: number;
    maxAgeYears: number;
}
export declare class AgeToGroupMappingResponseDto {
    bands: AgeBandResponseDto[];
}
export declare class ClassificationLabelsResponseDto {
    labels: ClassificationLabel[];
}
export declare class LanguagesResponseDto {
    supportedLanguages: string[];
    defaultLanguage: string;
}
export declare class RecipientSelectorResponseDto {
    type: string;
    userIds?: string[];
}
export declare class NotificationRecipientsRuleResponseDto {
    kind: string;
    town?: Town;
    selectors: RecipientSelectorResponseDto[];
}
export declare class NotificationRecipientsResponseDto {
    rules: NotificationRecipientsRuleResponseDto[];
}
export declare class MediaStorageResponseDto {
    providerHint?: 'local' | 'cloudinary';
    maxSizeBytes?: number;
    allowedMimeTypes?: string[];
}
