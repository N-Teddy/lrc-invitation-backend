"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var SettingsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const settings_schema_1 = require("../schema/settings.schema");
const settings_constants_1 = require("../common/constants/settings.constants");
const groups_constants_1 = require("../common/constants/groups.constants");
const attendance_enum_1 = require("../common/enums/attendance.enum");
const activity_enum_1 = require("../common/enums/activity.enum");
const app_config_service_1 = require("../config/app-config.service");
const settings_enum_1 = require("../common/enums/settings.enum");
let SettingsService = SettingsService_1 = class SettingsService {
    constructor(settingsModel, config) {
        this.settingsModel = settingsModel;
        this.config = config;
        this.logger = new common_1.Logger(SettingsService_1.name);
    }
    async onModuleInit() {
        await this.ensureDefaults();
    }
    async getAgeToGroupMapping() {
        const value = await this.getValue(settings_constants_1.SETTINGS_KEYS.AgeToGroupMapping);
        return { bands: value?.bands?.length ? value.bands : groups_constants_1.DEFAULT_AGE_TO_GROUP_MAPPING };
    }
    async setAgeToGroupMapping(bands) {
        this.validateAgeBands(bands);
        await this.setValue(settings_constants_1.SETTINGS_KEYS.AgeToGroupMapping, { bands });
        return { bands };
    }
    async getClassificationLabels() {
        const value = await this.getValue(settings_constants_1.SETTINGS_KEYS.ClassificationLabels);
        return {
            labels: (value?.labels ?? Object.values(attendance_enum_1.ClassificationLabel)),
        };
    }
    async setClassificationLabels(labels) {
        const unique = [...new Set(labels)];
        await this.setValue(settings_constants_1.SETTINGS_KEYS.ClassificationLabels, { labels: unique });
        return { labels: unique };
    }
    async getLanguages() {
        const supported = (await this.getValue(settings_constants_1.SETTINGS_KEYS.SupportedLanguages))?.languages ?? ['en', 'fr'];
        const defaultLanguage = (await this.getValue(settings_constants_1.SETTINGS_KEYS.DefaultLanguage))?.language ??
            'en';
        const normalizedSupported = [...new Set(supported.map((x) => x.trim()).filter(Boolean))];
        const normalizedDefault = defaultLanguage.trim();
        if (!normalizedSupported.includes(normalizedDefault)) {
            this.logger.warn(`defaultLanguage "${normalizedDefault}" missing from supportedLanguages; forcing fallback to "en"`);
            return { supportedLanguages: normalizedSupported, defaultLanguage: 'en' };
        }
        return { supportedLanguages: normalizedSupported, defaultLanguage: normalizedDefault };
    }
    async setLanguages(supportedLanguages, defaultLanguage) {
        const supported = [...new Set(supportedLanguages.map((x) => x.trim()).filter(Boolean))];
        const def = defaultLanguage.trim();
        if (!supported.length) {
            throw new common_1.BadRequestException('supportedLanguages cannot be empty');
        }
        if (!supported.includes(def)) {
            throw new common_1.BadRequestException('defaultLanguage must be included in supportedLanguages');
        }
        await this.setValue(settings_constants_1.SETTINGS_KEYS.SupportedLanguages, { languages: supported });
        await this.setValue(settings_constants_1.SETTINGS_KEYS.DefaultLanguage, { language: def });
        return { supportedLanguages: supported, defaultLanguage: def };
    }
    async getNotificationRecipients() {
        const value = await this.getValue(settings_constants_1.SETTINGS_KEYS.NotificationRecipients);
        return { rules: value?.rules ?? [] };
    }
    async setNotificationRecipients(rules) {
        for (const rule of rules) {
            if (!rule.kind?.trim()) {
                throw new common_1.BadRequestException('Recipient rule kind is required');
            }
            if (!Array.isArray(rule.selectors) || !rule.selectors.length) {
                throw new common_1.BadRequestException('Recipient rule selectors cannot be empty');
            }
            for (const selector of rule.selectors) {
                if (selector.type === settings_enum_1.RecipientSelectorType.ExplicitUsers &&
                    (!selector.userIds?.length || selector.userIds.some((x) => !x))) {
                    throw new common_1.BadRequestException('explicit_users selector requires userIds');
                }
            }
            if (rule.town && !Object.values(activity_enum_1.Town).includes(rule.town)) {
                throw new common_1.BadRequestException('Invalid town');
            }
        }
        await this.setValue(settings_constants_1.SETTINGS_KEYS.NotificationRecipients, { rules });
        return { rules };
    }
    async getMediaStorageSettings() {
        const value = await this.getValue(settings_constants_1.SETTINGS_KEYS.MediaStorage);
        return value ?? { providerHint: this.config.storageProvider };
    }
    async setMediaStorageSettings(settings) {
        await this.setValue(settings_constants_1.SETTINGS_KEYS.MediaStorage, settings);
        return settings;
    }
    async getValue(key) {
        const doc = await this.settingsModel.findOne({ key }).lean().exec();
        return doc?.value;
    }
    async setValue(key, value) {
        await this.settingsModel.findOneAndUpdate({ key }, { $set: { value } }, { upsert: true, new: true });
    }
    async ensureDefaults() {
        await this.settingsModel.updateOne({ key: settings_constants_1.SETTINGS_KEYS.AgeToGroupMapping }, {
            $setOnInsert: {
                key: settings_constants_1.SETTINGS_KEYS.AgeToGroupMapping,
                value: { bands: groups_constants_1.DEFAULT_AGE_TO_GROUP_MAPPING },
            },
        }, { upsert: true });
        await this.settingsModel.updateOne({ key: settings_constants_1.SETTINGS_KEYS.ClassificationLabels }, {
            $setOnInsert: {
                key: settings_constants_1.SETTINGS_KEYS.ClassificationLabels,
                value: { labels: Object.values(attendance_enum_1.ClassificationLabel) },
            },
        }, { upsert: true });
        await this.settingsModel.updateOne({ key: settings_constants_1.SETTINGS_KEYS.SupportedLanguages }, {
            $setOnInsert: {
                key: settings_constants_1.SETTINGS_KEYS.SupportedLanguages,
                value: { languages: ['en', 'fr'] },
            },
        }, { upsert: true });
        await this.settingsModel.updateOne({ key: settings_constants_1.SETTINGS_KEYS.DefaultLanguage }, {
            $setOnInsert: {
                key: settings_constants_1.SETTINGS_KEYS.DefaultLanguage,
                value: { language: 'en' },
            },
        }, { upsert: true });
        await this.settingsModel.updateOne({ key: settings_constants_1.SETTINGS_KEYS.NotificationRecipients }, {
            $setOnInsert: {
                key: settings_constants_1.SETTINGS_KEYS.NotificationRecipients,
                value: { rules: [] },
            },
        }, { upsert: true });
        await this.settingsModel.updateOne({ key: settings_constants_1.SETTINGS_KEYS.MediaStorage }, {
            $setOnInsert: {
                key: settings_constants_1.SETTINGS_KEYS.MediaStorage,
                value: { providerHint: this.config.storageProvider },
            },
        }, { upsert: true });
    }
    validateAgeBands(bands) {
        if (!bands?.length) {
            throw new common_1.BadRequestException('bands cannot be empty');
        }
        const seen = new Set();
        for (const band of bands) {
            if (seen.has(band.group)) {
                throw new common_1.BadRequestException(`Duplicate group band: ${band.group}`);
            }
            seen.add(band.group);
            if (band.minAgeYears > band.maxAgeYears) {
                throw new common_1.BadRequestException(`Invalid band for ${band.group}: min > max`);
            }
        }
    }
};
exports.SettingsService = SettingsService;
exports.SettingsService = SettingsService = SettingsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(settings_schema_1.Settings.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        app_config_service_1.AppConfigService])
], SettingsService);
//# sourceMappingURL=settings.service.js.map