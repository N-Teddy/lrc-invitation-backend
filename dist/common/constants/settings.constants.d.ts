export declare const SETTINGS_KEYS: {
    readonly AgeToGroupMapping: "ageToGroupMapping";
    readonly NotificationRecipients: "notificationRecipients";
    readonly ClassificationLabels: "classificationLabels";
    readonly SupportedLanguages: "supportedLanguages";
    readonly DefaultLanguage: "defaultLanguage";
    readonly MediaStorage: "mediaStorage";
};
export type SettingsKey = (typeof SETTINGS_KEYS)[keyof typeof SETTINGS_KEYS];
