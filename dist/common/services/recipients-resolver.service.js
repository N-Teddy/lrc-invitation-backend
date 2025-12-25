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
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecipientsResolverService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const user_enum_1 = require("../enums/user.enum");
const settings_enum_1 = require("../enums/settings.enum");
const settings_service_1 = require("../../settings/settings.service");
const user_schema_1 = require("../../schema/user.schema");
const monitor_profile_schema_1 = require("../../schema/monitor-profile.schema");
let RecipientsResolverService = class RecipientsResolverService {
    constructor(userModel, monitorProfileModel, settingsService) {
        this.userModel = userModel;
        this.monitorProfileModel = monitorProfileModel;
        this.settingsService = settingsService;
    }
    async resolve(kind, town) {
        const settings = await this.settingsService.getNotificationRecipients();
        const rules = settings.rules ?? [];
        const candidates = rules.filter((r) => r.kind === kind);
        const townRule = town ? candidates.find((r) => r.town === town) : undefined;
        const globalRule = candidates.find((r) => !r.town);
        const rule = townRule ?? globalRule;
        const selectors = rule?.selectors ??
            [
                { type: settings_enum_1.RecipientSelectorType.SuperMonitors },
                ...(town ? [{ type: settings_enum_1.RecipientSelectorType.TownMonitors }] : []),
            ];
        const users = [];
        for (const selector of selectors) {
            if (selector.type === settings_enum_1.RecipientSelectorType.SuperMonitors) {
                users.push(...(await this.userModel
                    .find({
                    role: user_enum_1.UserRole.Monitor,
                    monitorLevel: user_enum_1.MonitorLevel.Super,
                    lifecycleStatus: user_enum_1.LifecycleStatus.Active,
                })
                    .lean()
                    .exec()));
            }
            if (selector.type === settings_enum_1.RecipientSelectorType.TownMonitors) {
                if (town) {
                    const profiles = await this.monitorProfileModel
                        .find({ homeTown: town })
                        .select({ userId: 1 })
                        .lean()
                        .exec();
                    const ids = profiles.map((p) => p.userId);
                    users.push(...(await this.userModel
                        .find({
                        _id: { $in: ids },
                        role: user_enum_1.UserRole.Monitor,
                        lifecycleStatus: user_enum_1.LifecycleStatus.Active,
                    })
                        .lean()
                        .exec()));
                }
                else {
                    users.push(...(await this.userModel
                        .find({
                        role: user_enum_1.UserRole.Monitor,
                        lifecycleStatus: user_enum_1.LifecycleStatus.Active,
                    })
                        .lean()
                        .exec()));
                }
            }
            if (selector.type === settings_enum_1.RecipientSelectorType.ExplicitUsers) {
                if (!selector.userIds?.length)
                    continue;
                users.push(...(await this.userModel
                    .find({
                    _id: { $in: selector.userIds },
                    role: user_enum_1.UserRole.Monitor,
                    lifecycleStatus: user_enum_1.LifecycleStatus.Active,
                })
                    .lean()
                    .exec()));
            }
        }
        const seen = new Set();
        return users
            .map((u) => ({
            userId: String(u._id),
            email: u.email,
            phoneE164: u.whatsApp?.phoneE164,
            preferredLanguage: u.preferredLanguage,
            town: u.originTown,
        }))
            .filter((u) => {
            if (seen.has(u.userId))
                return false;
            seen.add(u.userId);
            return true;
        });
    }
};
exports.RecipientsResolverService = RecipientsResolverService;
exports.RecipientsResolverService = RecipientsResolverService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __param(1, (0, mongoose_1.InjectModel)(monitor_profile_schema_1.MonitorProfile.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        settings_service_1.SettingsService])
], RecipientsResolverService);
//# sourceMappingURL=recipients-resolver.service.js.map