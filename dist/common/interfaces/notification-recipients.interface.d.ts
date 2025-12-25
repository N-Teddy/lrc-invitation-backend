import { Town } from '../enums/activity.enum';
import { RecipientSelectorType } from '../enums/settings.enum';
export interface RecipientSelector {
    type: RecipientSelectorType;
    userIds?: string[];
}
export interface NotificationRecipientsSettingsRule {
    kind: string;
    town?: Town;
    selectors: RecipientSelector[];
}
export interface NotificationRecipientsSettings {
    rules: NotificationRecipientsSettingsRule[];
}
