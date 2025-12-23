import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Town } from '../enums/activity.enum';
import { LifecycleStatus, MonitorLevel, UserRole } from '../enums/user.enum';
import { RecipientSelectorType } from '../enums/settings.enum';
import { SettingsService } from '../../settings/settings.service';
import { User, UserDocument } from '../../schema/user.schema';
import { MonitorProfile, MonitorProfileDocument } from '../../schema/monitor-profile.schema';

export interface RecipientContact {
    userId: string;
    email?: string;
    phoneE164?: string;
    preferredLanguage?: string;
    town?: Town;
}

@Injectable()
export class RecipientsResolverService {
    constructor(
        @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
        @InjectModel(MonitorProfile.name)
        private readonly monitorProfileModel: Model<MonitorProfileDocument>,
        private readonly settingsService: SettingsService,
    ) {}

    async resolve(kind: string, town?: Town): Promise<RecipientContact[]> {
        const settings = await this.settingsService.getNotificationRecipients();
        const rules = settings.rules ?? [];

        const candidates = rules.filter((r) => r.kind === kind);
        const townRule = town ? candidates.find((r) => r.town === town) : undefined;
        const globalRule = candidates.find((r) => !r.town);
        const rule = townRule ?? globalRule;

        const selectors =
            rule?.selectors ??
            ([
                { type: RecipientSelectorType.SuperMonitors },
                ...(town ? [{ type: RecipientSelectorType.TownMonitors }] : []),
            ] as Array<{ type: RecipientSelectorType; userIds?: string[] }>);

        const users: any[] = [];

        for (const selector of selectors) {
            if (selector.type === RecipientSelectorType.SuperMonitors) {
                users.push(
                    ...(await this.userModel
                        .find({
                            role: UserRole.Monitor,
                            monitorLevel: MonitorLevel.Super,
                            lifecycleStatus: LifecycleStatus.Active,
                        })
                        .lean()
                        .exec()),
                );
            }

            if (selector.type === RecipientSelectorType.TownMonitors) {
                if (town) {
                    const profiles = await this.monitorProfileModel
                        .find({ homeTown: town })
                        .select({ userId: 1 })
                        .lean()
                        .exec();
                    const ids = profiles.map((p) => p.userId);
                    users.push(
                        ...(await this.userModel
                            .find({
                                _id: { $in: ids },
                                role: UserRole.Monitor,
                                lifecycleStatus: LifecycleStatus.Active,
                            })
                            .lean()
                            .exec()),
                    );
                } else {
                    users.push(
                        ...(await this.userModel
                            .find({
                                role: UserRole.Monitor,
                                lifecycleStatus: LifecycleStatus.Active,
                            })
                            .lean()
                            .exec()),
                    );
                }
            }

            if (selector.type === RecipientSelectorType.ExplicitUsers) {
                if (!selector.userIds?.length) continue;
                users.push(
                    ...(await this.userModel
                        .find({
                            _id: { $in: selector.userIds },
                            role: UserRole.Monitor,
                            lifecycleStatus: LifecycleStatus.Active,
                        })
                        .lean()
                        .exec()),
                );
            }
        }

        const seen = new Set<string>();
        return users
            .map((u) => ({
                userId: String(u._id),
                email: u.email as string | undefined,
                phoneE164: u.whatsApp?.phoneE164 as string | undefined,
                preferredLanguage: u.preferredLanguage as string | undefined,
                town: u.originTown as Town | undefined,
            }))
            .filter((u) => {
                if (seen.has(u.userId)) return false;
                seen.add(u.userId);
                return true;
            });
    }
}
