export const SETTINGS_KEYS = {
    AgeToGroupMapping: 'ageToGroupMapping',
    NotificationRecipients: 'notificationRecipients',
    ClassificationLabels: 'classificationLabels',
    SupportedLanguages: 'supportedLanguages',
    DefaultLanguage: 'defaultLanguage',
    MediaStorage: 'mediaStorage',
} as const;

export type SettingsKey = (typeof SETTINGS_KEYS)[keyof typeof SETTINGS_KEYS];
