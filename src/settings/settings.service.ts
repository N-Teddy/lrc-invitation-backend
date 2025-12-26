import { BadRequestException, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Settings, SettingsDocument } from '../schema/settings.schema';
import { SETTINGS_KEYS } from '../common/constants/settings.constants';
import { DEFAULT_AGE_TO_GROUP_MAPPING, AgeBand } from '../common/constants/groups.constants';
import { ClassificationLabel } from '../common/enums/attendance.enum';
import { Town } from '../common/enums/activity.enum';
import { AppConfigService } from '../config/app-config.service';
import { MediaStorageSettings } from '../common/interfaces/media-storage-settings.interface';
import {
    NotificationRecipientsSettings,
    NotificationRecipientsSettingsRule,
} from '../common/interfaces/notification-recipients.interface';
import { RecipientSelectorType } from '../common/enums/settings.enum';

@Injectable()
export class SettingsService implements OnModuleInit {
    private readonly logger = new Logger(SettingsService.name);

    constructor(
        @InjectModel(Settings.name)
        private readonly settingsModel: Model<SettingsDocument>,
        private readonly config: AppConfigService,
    ) {}

    async onModuleInit() {
        await this.ensureDefaults();
    }

    async getAgeToGroupMapping(): Promise<{ bands: AgeBand[] }> {
        const value = await this.getValue<{ bands: AgeBand[] }>(SETTINGS_KEYS.AgeToGroupMapping);
        return { bands: value?.bands?.length ? value.bands : DEFAULT_AGE_TO_GROUP_MAPPING };
    }

    async setAgeToGroupMapping(bands: AgeBand[]) {
        this.validateAgeBands(bands);
        await this.setValue(SETTINGS_KEYS.AgeToGroupMapping, { bands });
        return { bands };
    }

    async getClassificationLabels(): Promise<{ labels: ClassificationLabel[] }> {
        const value = await this.getValue<{ labels: ClassificationLabel[] }>(
            SETTINGS_KEYS.ClassificationLabels,
        );
        return {
            labels: (value?.labels ?? Object.values(ClassificationLabel)) as ClassificationLabel[],
        };
    }

    async setClassificationLabels(labels: ClassificationLabel[]) {
        const unique = [...new Set(labels)];
        await this.setValue(SETTINGS_KEYS.ClassificationLabels, { labels: unique });
        return { labels: unique };
    }

    async getLanguages(): Promise<{ supportedLanguages: string[]; defaultLanguage: string }> {
        const supported = (
            await this.getValue<{ languages: string[] }>(SETTINGS_KEYS.SupportedLanguages)
        )?.languages ?? ['en', 'fr'];
        const defaultLanguage =
            (await this.getValue<{ language: string }>(SETTINGS_KEYS.DefaultLanguage))?.language ??
            'en';

        const normalizedSupported = [...new Set(supported.map((x) => x.trim()).filter(Boolean))];
        const normalizedDefault = defaultLanguage.trim();

        if (!normalizedSupported.includes(normalizedDefault)) {
            this.logger.warn(
                `defaultLanguage "${normalizedDefault}" missing from supportedLanguages; forcing fallback to "en"`,
            );
            return { supportedLanguages: normalizedSupported, defaultLanguage: 'en' };
        }

        return { supportedLanguages: normalizedSupported, defaultLanguage: normalizedDefault };
    }

    async setLanguages(supportedLanguages: string[], defaultLanguage: string) {
        const supported = [...new Set(supportedLanguages.map((x) => x.trim()).filter(Boolean))];
        const def = defaultLanguage.trim();
        if (!supported.length) {
            throw new BadRequestException('supportedLanguages cannot be empty');
        }
        if (!supported.includes(def)) {
            throw new BadRequestException('defaultLanguage must be included in supportedLanguages');
        }

        await this.setValue(SETTINGS_KEYS.SupportedLanguages, { languages: supported });
        await this.setValue(SETTINGS_KEYS.DefaultLanguage, { language: def });
        return { supportedLanguages: supported, defaultLanguage: def };
    }

    async getNotificationRecipients(): Promise<NotificationRecipientsSettings> {
        const value = await this.getValue<NotificationRecipientsSettings>(
            SETTINGS_KEYS.NotificationRecipients,
        );
        return { rules: value?.rules ?? [] };
    }

    async setNotificationRecipients(rules: NotificationRecipientsSettingsRule[]) {
        for (const rule of rules) {
            if (!rule.kind?.trim()) {
                throw new BadRequestException('Recipient rule kind is required');
            }
            if (!Array.isArray(rule.selectors) || !rule.selectors.length) {
                throw new BadRequestException('Recipient rule selectors cannot be empty');
            }
            for (const selector of rule.selectors) {
                if (
                    selector.type === RecipientSelectorType.ExplicitUsers &&
                    (!selector.userIds?.length || selector.userIds.some((x) => !x))
                ) {
                    throw new BadRequestException('explicit_users selector requires userIds');
                }
            }
            if (rule.town && !Object.values(Town).includes(rule.town as Town)) {
                throw new BadRequestException('Invalid town');
            }
        }

        await this.setValue(SETTINGS_KEYS.NotificationRecipients, { rules });
        return { rules };
    }

    async getMediaStorageSettings(): Promise<MediaStorageSettings> {
        const value = await this.getValue<MediaStorageSettings>(SETTINGS_KEYS.MediaStorage);
        return value ?? { providerHint: this.config.storageProvider };
    }

    async setMediaStorageSettings(settings: MediaStorageSettings) {
        await this.setValue(SETTINGS_KEYS.MediaStorage, settings);
        return settings;
    }

    async getActivityYearLocks(): Promise<{ lockedYears: number[] }> {
        const value = await this.getValue<{ lockedYears: number[] }>(
            SETTINGS_KEYS.ActivityYearLocks,
        );
        const lockedYears = (value?.lockedYears ?? []).filter((y) =>
            Number.isFinite(y),
        ) as number[];
        return { lockedYears: [...new Set(lockedYears)].sort((a, b) => a - b) };
    }

    async lockActivityYear(year: number): Promise<{ lockedYears: number[] }> {
        if (!Number.isFinite(year) || year < 2000 || year > 2100) {
            throw new BadRequestException('Invalid year');
        }
        const existing = await this.getActivityYearLocks();
        const next = [...new Set([...existing.lockedYears, year])].sort((a, b) => a - b);
        await this.setValue(SETTINGS_KEYS.ActivityYearLocks, { lockedYears: next });
        return { lockedYears: next };
    }

    async isActivityYearLocked(year: number): Promise<boolean> {
        const locks = await this.getActivityYearLocks();
        return locks.lockedYears.includes(year);
    }

    async getAuthMode(): Promise<{ mode: 'magic_link' | 'direct_email' }> {
        const value = await this.getValue<{ mode?: 'magic_link' | 'direct_email' }>(
            SETTINGS_KEYS.AuthMode,
        );
        const mode = value?.mode ?? this.config.authMode;
        if (mode !== 'magic_link' && mode !== 'direct_email') {
            return { mode: 'magic_link' };
        }
        return { mode };
    }

    async setAuthMode(mode: 'magic_link' | 'direct_email'): Promise<{ mode: 'magic_link' | 'direct_email' }> {
        await this.setValue(SETTINGS_KEYS.AuthMode, { mode });
        return { mode };
    }

    private async getValue<T>(key: string): Promise<T | undefined> {
        const doc = await this.settingsModel.findOne({ key }).lean().exec();
        return doc?.value as T | undefined;
    }

    private async setValue(key: string, value: Record<string, any>) {
        await this.settingsModel.findOneAndUpdate(
            { key },
            { $set: { value } },
            { upsert: true, new: true },
        );
    }

    private async ensureDefaults() {
        await this.settingsModel.updateOne(
            { key: SETTINGS_KEYS.AgeToGroupMapping },
            {
                $setOnInsert: {
                    key: SETTINGS_KEYS.AgeToGroupMapping,
                    value: { bands: DEFAULT_AGE_TO_GROUP_MAPPING },
                },
            },
            { upsert: true },
        );

        await this.settingsModel.updateOne(
            { key: SETTINGS_KEYS.ClassificationLabels },
            {
                $setOnInsert: {
                    key: SETTINGS_KEYS.ClassificationLabels,
                    value: { labels: Object.values(ClassificationLabel) },
                },
            },
            { upsert: true },
        );

        await this.settingsModel.updateOne(
            { key: SETTINGS_KEYS.SupportedLanguages },
            {
                $setOnInsert: {
                    key: SETTINGS_KEYS.SupportedLanguages,
                    value: { languages: ['en', 'fr'] },
                },
            },
            { upsert: true },
        );

        await this.settingsModel.updateOne(
            { key: SETTINGS_KEYS.DefaultLanguage },
            {
                $setOnInsert: {
                    key: SETTINGS_KEYS.DefaultLanguage,
                    value: { language: 'en' },
                },
            },
            { upsert: true },
        );

        await this.settingsModel.updateOne(
            { key: SETTINGS_KEYS.NotificationRecipients },
            {
                $setOnInsert: {
                    key: SETTINGS_KEYS.NotificationRecipients,
                    value: { rules: [] },
                },
            },
            { upsert: true },
        );

        await this.settingsModel.updateOne(
            { key: SETTINGS_KEYS.MediaStorage },
            {
                $setOnInsert: {
                    key: SETTINGS_KEYS.MediaStorage,
                    value: { providerHint: this.config.storageProvider },
                },
            },
            { upsert: true },
        );

        await this.settingsModel.updateOne(
            { key: SETTINGS_KEYS.ActivityYearLocks },
            {
                $setOnInsert: {
                    key: SETTINGS_KEYS.ActivityYearLocks,
                    value: { lockedYears: [] },
                },
            },
            { upsert: true },
        );

        await this.settingsModel.updateOne(
            { key: SETTINGS_KEYS.AuthMode },
            {
                $setOnInsert: {
                    key: SETTINGS_KEYS.AuthMode,
                    value: { mode: this.config.authMode },
                },
            },
            { upsert: true },
        );
    }

    private validateAgeBands(bands: AgeBand[]) {
        if (!bands?.length) {
            throw new BadRequestException('bands cannot be empty');
        }

        const seen = new Set<string>();
        for (const band of bands) {
            if (seen.has(band.group)) {
                throw new BadRequestException(`Duplicate group band: ${band.group}`);
            }
            seen.add(band.group);
            if (band.minAgeYears > band.maxAgeYears) {
                throw new BadRequestException(`Invalid band for ${band.group}: min > max`);
            }
        }
    }
}
