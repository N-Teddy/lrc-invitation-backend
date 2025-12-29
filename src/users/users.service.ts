import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from '../schema/user.schema';
import { MonitorProfile, MonitorProfileDocument } from '../schema/monitor-profile.schema';
import { CreateUserData, UpdateUserData } from '../common/interfaces/user-data.interface';
import { v4 as uuidv4 } from 'uuid';
import { LifecycleStatus, MonitorLevel, UserRole } from '../common/enums/user.enum';
import { Town } from '../common/enums/activity.enum';
import { MediaService } from '../media/media.service';

@Injectable()
export class UsersService {
    constructor(
        @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
        @InjectModel(MonitorProfile.name)
        private readonly monitorProfileModel: Model<MonitorProfileDocument>,
        private readonly mediaService: MediaService,
    ) {}

    async create(data: CreateUserData): Promise<Record<string, any>> {
        const user = new this.userModel({
            fullName: data.fullName,
            role: data.role,
            monitorLevel: data.monitorLevel,
            email: data.email?.toLowerCase(),
            googleId: data.googleId,
            googleEmail: data.googleEmail,
            googleLinkedAt: data.googleLinkedAt,
            dateOfBirth: data.dateOfBirth,
            originTown: data.originTown,
            preferredLanguage: data.preferredLanguage,
            lifecycleStatus: data.lifecycleStatus,
            registrationPendingApproval: data.registrationPendingApproval,
            magicToken: data.magicToken,
            magicExpiresAt: data.magicExpiresAt,
            whatsApp: data.whatsAppPhoneE164
                ? {
                      phoneE164: data.whatsAppPhoneE164,
                      optIn: data.whatsAppOptIn ?? true,
                  }
                : undefined,
        });
        const saved = await user.save();

        if (saved.role === UserRole.Monitor) {
            const userTown = (data.homeTown ?? data.originTown) as Town | undefined;
            if (userTown) {
                await this.monitorProfileModel
                    .updateOne(
                        { userId: saved._id },
                        {
                            $set: {
                                userId: saved._id,
                                homeTown: userTown,
                                level: (data.monitorLevel ?? saved.monitorLevel) as MonitorLevel,
                                preferredLanguage: data.preferredLanguage,
                            },
                        },
                        { upsert: true },
                    )
                    .exec();
            }
        }

        return this.normalizeUser(saved.toObject());
    }

    async findAll(): Promise<Record<string, any>[]> {
        const users = await this.userModel.find().lean().exec();
        return users.map((user) => this.normalizeUser(user));
    }

    async listUsers(params: {
        q?: string;
        role?: UserRole;
        status?: LifecycleStatus;
        pendingApproval?: boolean;
        town?: Town;
        page: number;
        limit: number;
    }): Promise<{ items: Record<string, any>[]; page: number; limit: number; total: number }> {
        const page = Number.isFinite(params.page) && params.page > 0 ? Math.floor(params.page) : 1;
        const limitRaw =
            Number.isFinite(params.limit) && params.limit > 0 ? Math.floor(params.limit) : 20;
        const limit = Math.min(Math.max(limitRaw, 1), 100);
        const skip = (page - 1) * limit;

        const filter: Record<string, any> = {};
        if (params.role) filter.role = params.role;
        if (params.status) filter.lifecycleStatus = params.status;
        if (params.pendingApproval === true) {
            filter.registrationPendingApproval = true;
        } else if (params.pendingApproval === false) {
            filter.registrationPendingApproval = { $ne: true };
        }
        if (params.town) filter.originTown = params.town;

        const q = params.q?.trim();
        if (q) {
            filter.$or = [
                { fullName: { $regex: q, $options: 'i' } },
                { email: { $regex: q, $options: 'i' } },
            ];
        }

        const [itemsRaw, total] = await Promise.all([
            this.userModel
                .find(filter)
                .sort({ registrationPendingApproval: -1, createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean()
                .exec(),
            this.userModel.countDocuments(filter).exec(),
        ]);

        return {
            items: itemsRaw.map((u) => this.normalizeUser(u)),
            page,
            limit,
            total,
        };
    }

    async findById(id: string): Promise<Record<string, any> | null> {
        const user = await this.userModel.findById(id).lean().exec();
        return user ? this.normalizeUser(user) : null;
    }

    async findByEmail(email: string): Promise<Record<string, any> | null> {
        const user = await this.userModel.findOne({ email: email.toLowerCase() }).lean().exec();
        return user ? this.normalizeUser(user) : null;
    }

    async findByMagicToken(token: string): Promise<Record<string, any> | null> {
        const user = await this.userModel.findOne({ magicToken: token }).lean().exec();
        return user ? this.normalizeUser(user) : null;
    }

    async findByMagicTokenForAuth(token: string): Promise<Record<string, any> | null> {
        const user = await this.userModel
            .findOne({ magicToken: token })
            .select({
                _id: 1,
                role: 1,
                monitorLevel: 1,
                registrationPendingApproval: 1,
                lifecycleStatus: 1,
                magicExpiresAt: 1,
            })
            .lean()
            .exec();
        if (!user) return null;
        return { ...user, id: user._id ? String(user._id) : undefined };
    }

    async setMagicToken(userId: string | Types.ObjectId, magicToken: string, magicExpiresAt: Date) {
        await this.userModel
            .findByIdAndUpdate(userId, { $set: { magicToken, magicExpiresAt } })
            .exec();
    }

    async clearMagicToken(userId: string | Types.ObjectId) {
        await this.userModel
            .findByIdAndUpdate(userId, { $unset: { magicToken: '', magicExpiresAt: '' } })
            .exec();
    }

    async findByGoogleId(googleId: string): Promise<Record<string, any> | null> {
        const user = await this.userModel.findOne({ googleId }).lean().exec();
        return user ? this.normalizeUser(user) : null;
    }

    async linkGoogle(userId: string | Types.ObjectId, googleId: string, googleEmail: string) {
        await this.userModel
            .findByIdAndUpdate(userId, {
                $set: {
                    googleId,
                    googleEmail,
                    googleLinkedAt: new Date(),
                },
            })
            .exec();
    }

    async findOneOrFail(id: string): Promise<Record<string, any>> {
        const user = await this.findById(id);
        if (!user) {
            throw new NotFoundException('User not found');
        }
        return user;
    }

    async update(id: string, data: UpdateUserData): Promise<Record<string, any>> {
        const user = await this.userModel
            .findByIdAndUpdate(
                id,
                {
                    $set: {
                        ...data,
                        email: data.email?.toLowerCase(),
                        whatsApp: data.whatsAppPhoneE164
                            ? {
                                  phoneE164: data.whatsAppPhoneE164,
                                  optIn: data.whatsAppOptIn ?? true,
                              }
                            : undefined,
                    },
                },
                { new: true },
            )
            .lean()
            .exec();
        if (!user) {
            throw new NotFoundException('User not found');
        }

        if (user.role === UserRole.Monitor && (data.homeTown || data.originTown)) {
            const town = (data.homeTown ?? data.originTown) as Town;
            await this.monitorProfileModel
                .updateOne(
                    { userId: new Types.ObjectId(String(id)) },
                    { $set: { userId: new Types.ObjectId(String(id)), homeTown: town } },
                    { upsert: true },
                )
                .exec();
        }

        return this.normalizeUser(user);
    }

    async updateProfileImage(userId: string, profileImage: Record<string, any>) {
        const existing = await this.userModel.findById(userId).lean().exec();
        if (!existing) {
            throw new NotFoundException('User not found');
        }

        const user = await this.userModel
            .findByIdAndUpdate(userId, { $set: { profileImage } }, { new: true })
            .lean()
            .exec();
        if (!user) {
            throw new NotFoundException('User not found');
        }

        const oldImage = existing.profileImage as
            | { url?: string; provider?: string; publicId?: string }
            | undefined;
        if (oldImage?.url && oldImage.url !== profileImage.url) {
            try {
                await this.mediaService.deleteProfileImage(oldImage);
            } catch {
                // Ignore cleanup errors to avoid blocking profile updates.
            }
        }

        return this.normalizeUser(user);
    }

    async updateMyPreferences(
        currentUser: Record<string, any>,
        dto: { preferredLanguage?: string },
    ): Promise<Record<string, any>> {
        const id = String(currentUser?.id ?? currentUser?._id);
        if (!id) throw new ForbiddenException('Missing user');

        const update: Record<string, any> = {};
        if (dto.preferredLanguage !== undefined) {
            update.preferredLanguage = dto.preferredLanguage.trim();
        }

        const user = await this.userModel
            .findByIdAndUpdate(id, { $set: update }, { new: true })
            .lean()
            .exec();
        if (!user) throw new NotFoundException('User not found');

        if (user.role === UserRole.Monitor && dto.preferredLanguage !== undefined) {
            await this.monitorProfileModel
                .updateOne(
                    { userId: new Types.ObjectId(String(id)) },
                    { $set: { preferredLanguage: update.preferredLanguage } },
                    { upsert: true },
                )
                .exec();
        }

        return this.normalizeUser(user);
    }

    async remove(id: string): Promise<void> {
        const existing = await this.userModel.findById(id).lean().exec();
        if (!existing) throw new NotFoundException('User not found');

        // Children are never hard-deleted; archive instead.
        if (existing.role === UserRole.Child) {
            await this.userModel
                .findByIdAndUpdate(id, {
                    $set: {
                        lifecycleStatus: LifecycleStatus.Archived,
                        archivedReason: 'manual_archive',
                    },
                })
                .exec();
            return;
        }

        await this.userModel.findByIdAndDelete(id).exec();
    }

    async approveMonitorRegistration(userId: string): Promise<{
        user: Record<string, any>;
        magicToken?: string;
        magicExpiresAt?: Date;
    }> {
        const existing = await this.userModel.findById(userId).lean().exec();
        if (!existing) {
            throw new NotFoundException('User not found');
        }
        if (existing.role !== UserRole.Monitor) {
            throw new NotFoundException('Monitor not found');
        }

        const isPending = !!existing.registrationPendingApproval;
        const magicToken = uuidv4();
        const magicExpiresAt = new Date(Date.now() + 30 * 60 * 1000);

        const updated = await this.userModel
            .findByIdAndUpdate(
                userId,
                {
                    $set: {
                        registrationPendingApproval: false,
                        ...(isPending ? { magicToken, magicExpiresAt } : {}),
                    },
                },
                { new: true },
            )
            .lean()
            .exec();

        if (!updated) {
            throw new NotFoundException('User not found');
        }

        return {
            user: this.normalizeUser(updated),
            magicToken: isPending ? magicToken : undefined,
            magicExpiresAt: isPending ? magicExpiresAt : undefined,
        };
    }

    async rejectMonitorRegistration(userId: string): Promise<Record<string, any>> {
        const existing = await this.userModel.findById(userId).lean().exec();
        if (!existing) throw new NotFoundException('User not found');
        if (existing.role !== UserRole.Monitor) {
            throw new BadRequestException('Only monitor registrations can be rejected');
        }
        if (!existing.registrationPendingApproval) {
            throw new BadRequestException('User is not pending approval');
        }

        const updated = await this.userModel
            .findByIdAndUpdate(
                userId,
                {
                    $set: {
                        registrationPendingApproval: false,
                        lifecycleStatus: LifecycleStatus.Archived,
                        archivedReason: 'registration_rejected',
                    },
                    $unset: {
                        magicToken: '',
                        magicExpiresAt: '',
                    },
                },
                { new: true },
            )
            .lean()
            .exec();
        if (!updated) throw new NotFoundException('User not found');
        return this.normalizeUser(updated);
    }

    async assertCanApproveMonitorRegistration(approver: Record<string, any>, targetUserId: string) {
        if (approver?.role !== UserRole.Monitor || approver?.monitorLevel !== MonitorLevel.Super) {
            throw new ForbiddenException('Only Super Monitors can approve registrations');
        }

        const profileTown = await this.getMonitorHomeTown(targetUserId);
        let targetTown = profileTown;
        if (!targetTown) {
            const user = await this.userModel
                .findById(targetUserId)
                .select({ originTown: 1 })
                .lean()
                .exec();
            targetTown = (user as any)?.originTown as Town | undefined;
        }

        if (!targetTown) {
            // If town is not set, allow approval (but this should be prevented by registration validation).
            return;
        }

        const hasTownSupers = await this.hasSuperMonitorsInTown(targetTown as Town);
        if (!hasTownSupers) {
            // Fallback rule: if the town has no super monitors, any super monitor can approve.
            return;
        }

        const approverId = String(approver?._id ?? approver?.id ?? '');
        const approverTown =
            (await this.getMonitorHomeTown(approverId)) ??
            (approver?.originTown as Town | undefined);

        if (!approverTown || approverTown !== (targetTown as Town)) {
            throw new ForbiddenException('You can only approve registrations for your town');
        }
    }

    async findSuperMonitorsByTownForApproval(
        town: Town,
    ): Promise<
        Array<{ id: string; email?: string; fullName: string; preferredLanguage?: string }>
    > {
        const townProfiles = await this.monitorProfileModel
            .find({ homeTown: town })
            .select({ userId: 1 })
            .lean()
            .exec();
        const ids = townProfiles.map((p) => p.userId);
        if (!ids.length) return [];

        const users = await this.userModel
            .find({
                _id: { $in: ids },
                role: UserRole.Monitor,
                monitorLevel: MonitorLevel.Super,
                lifecycleStatus: LifecycleStatus.Active,
            })
            .select({ _id: 1, fullName: 1, email: 1, preferredLanguage: 1 })
            .lean()
            .exec();

        return users.map((u) => ({
            id: String(u._id),
            email: u.email as string | undefined,
            fullName: u.fullName as string,
            preferredLanguage: u.preferredLanguage as string | undefined,
        }));
    }

    async findAllSuperMonitors(): Promise<
        Array<{ id: string; email?: string; fullName: string; preferredLanguage?: string }>
    > {
        const users = await this.userModel
            .find({
                role: UserRole.Monitor,
                monitorLevel: MonitorLevel.Super,
                lifecycleStatus: LifecycleStatus.Active,
            })
            .select({ _id: 1, fullName: 1, email: 1, preferredLanguage: 1 })
            .lean()
            .exec();

        return users.map((u) => ({
            id: String(u._id),
            email: u.email as string | undefined,
            fullName: u.fullName as string,
            preferredLanguage: u.preferredLanguage as string | undefined,
        }));
    }

    async hasSuperMonitorsInTown(town: Town): Promise<boolean> {
        const townProfiles = await this.monitorProfileModel
            .find({ homeTown: town })
            .select({ userId: 1 })
            .lean()
            .exec();
        const ids = townProfiles.map((p) => p.userId);
        if (!ids.length) return false;

        const count = await this.userModel
            .countDocuments({
                _id: { $in: ids },
                role: UserRole.Monitor,
                monitorLevel: MonitorLevel.Super,
                lifecycleStatus: LifecycleStatus.Active,
            })
            .exec();
        return count > 0;
    }

    async getMonitorHomeTown(userId: string | Types.ObjectId): Promise<Town | undefined> {
        const profile = await this.monitorProfileModel
            .findOne({ userId: new Types.ObjectId(String(userId)) })
            .select({ homeTown: 1 })
            .lean()
            .exec();
        return profile?.homeTown as Town | undefined;
    }

    private normalizeUser(user: Record<string, any>): Record<string, any> {
        if (!user) {
            return user;
        }
        const id = user._id ? String(user._id) : undefined;
        const normalized: Record<string, any> = { ...user, id };
        delete normalized._id;
        delete normalized.__v;
        delete normalized.magicToken;
        delete normalized.magicExpiresAt;
        return normalized;
    }
}
