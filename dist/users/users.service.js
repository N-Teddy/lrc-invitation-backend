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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const user_schema_1 = require("../schema/user.schema");
const monitor_profile_schema_1 = require("../schema/monitor-profile.schema");
const uuid_1 = require("uuid");
const user_enum_1 = require("../common/enums/user.enum");
let UsersService = class UsersService {
    constructor(userModel, monitorProfileModel) {
        this.userModel = userModel;
        this.monitorProfileModel = monitorProfileModel;
    }
    async create(data) {
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
        if (saved.role === user_enum_1.UserRole.Monitor) {
            const userTown = (data.homeTown ?? data.originTown);
            if (userTown) {
                await this.monitorProfileModel
                    .updateOne({ userId: saved._id }, {
                    $set: {
                        userId: saved._id,
                        homeTown: userTown,
                        level: (data.monitorLevel ?? saved.monitorLevel),
                        preferredLanguage: data.preferredLanguage,
                    },
                }, { upsert: true })
                    .exec();
            }
        }
        return this.normalizeUser(saved.toObject());
    }
    async findAll() {
        const users = await this.userModel.find().lean().exec();
        return users.map((user) => this.normalizeUser(user));
    }
    async findById(id) {
        const user = await this.userModel.findById(id).lean().exec();
        return user ? this.normalizeUser(user) : null;
    }
    async findByEmail(email) {
        const user = await this.userModel.findOne({ email: email.toLowerCase() }).lean().exec();
        return user ? this.normalizeUser(user) : null;
    }
    async findByMagicToken(token) {
        const user = await this.userModel.findOne({ magicToken: token }).lean().exec();
        return user ? this.normalizeUser(user) : null;
    }
    async findByMagicTokenForAuth(token) {
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
        if (!user)
            return null;
        return { ...user, id: user._id ? String(user._id) : undefined };
    }
    async setMagicToken(userId, magicToken, magicExpiresAt) {
        await this.userModel
            .findByIdAndUpdate(userId, { $set: { magicToken, magicExpiresAt } })
            .exec();
    }
    async clearMagicToken(userId) {
        await this.userModel
            .findByIdAndUpdate(userId, { $unset: { magicToken: '', magicExpiresAt: '' } })
            .exec();
    }
    async findByGoogleId(googleId) {
        const user = await this.userModel.findOne({ googleId }).lean().exec();
        return user ? this.normalizeUser(user) : null;
    }
    async linkGoogle(userId, googleId, googleEmail) {
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
    async findOneOrFail(id) {
        const user = await this.findById(id);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return user;
    }
    async update(id, data) {
        const user = await this.userModel
            .findByIdAndUpdate(id, {
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
        }, { new: true })
            .lean()
            .exec();
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (user.role === user_enum_1.UserRole.Monitor && (data.homeTown || data.originTown)) {
            const town = (data.homeTown ?? data.originTown);
            await this.monitorProfileModel
                .updateOne({ userId: new mongoose_2.Types.ObjectId(String(id)) }, { $set: { userId: new mongoose_2.Types.ObjectId(String(id)), homeTown: town } }, { upsert: true })
                .exec();
        }
        return this.normalizeUser(user);
    }
    async updateProfileImage(userId, profileImage) {
        const user = await this.userModel
            .findByIdAndUpdate(userId, { $set: { profileImage } }, { new: true })
            .lean()
            .exec();
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return this.normalizeUser(user);
    }
    async updateMyPreferences(currentUser, dto) {
        const id = String(currentUser?.id ?? currentUser?._id);
        if (!id)
            throw new common_1.ForbiddenException('Missing user');
        const update = {};
        if (dto.preferredLanguage !== undefined) {
            update.preferredLanguage = dto.preferredLanguage.trim();
        }
        const user = await this.userModel
            .findByIdAndUpdate(id, { $set: update }, { new: true })
            .lean()
            .exec();
        if (!user)
            throw new common_1.NotFoundException('User not found');
        if (user.role === user_enum_1.UserRole.Monitor && dto.preferredLanguage !== undefined) {
            await this.monitorProfileModel
                .updateOne({ userId: new mongoose_2.Types.ObjectId(String(id)) }, { $set: { preferredLanguage: update.preferredLanguage } }, { upsert: true })
                .exec();
        }
        return this.normalizeUser(user);
    }
    async remove(id) {
        const existing = await this.userModel.findById(id).lean().exec();
        if (!existing)
            throw new common_1.NotFoundException('User not found');
        if (existing.role === user_enum_1.UserRole.Child) {
            await this.userModel
                .findByIdAndUpdate(id, {
                $set: {
                    lifecycleStatus: user_enum_1.LifecycleStatus.Archived,
                    archivedReason: 'manual_archive',
                },
            })
                .exec();
            return;
        }
        await this.userModel.findByIdAndDelete(id).exec();
    }
    async approveMonitorRegistration(userId) {
        const existing = await this.userModel.findById(userId).lean().exec();
        if (!existing) {
            throw new common_1.NotFoundException('User not found');
        }
        if (existing.role !== user_enum_1.UserRole.Monitor) {
            throw new common_1.NotFoundException('Monitor not found');
        }
        const isPending = !!existing.registrationPendingApproval;
        const magicToken = (0, uuid_1.v4)();
        const magicExpiresAt = new Date(Date.now() + 30 * 60 * 1000);
        const updated = await this.userModel
            .findByIdAndUpdate(userId, {
            $set: {
                registrationPendingApproval: false,
                ...(isPending ? { magicToken, magicExpiresAt } : {}),
            },
        }, { new: true })
            .lean()
            .exec();
        if (!updated) {
            throw new common_1.NotFoundException('User not found');
        }
        return {
            user: this.normalizeUser(updated),
            magicToken: isPending ? magicToken : undefined,
            magicExpiresAt: isPending ? magicExpiresAt : undefined,
        };
    }
    async assertCanApproveMonitorRegistration(approver, targetUserId) {
        if (approver?.role !== user_enum_1.UserRole.Monitor || approver?.monitorLevel !== user_enum_1.MonitorLevel.Super) {
            throw new common_1.ForbiddenException('Only Super Monitors can approve registrations');
        }
        const profileTown = await this.getMonitorHomeTown(targetUserId);
        let targetTown = profileTown;
        if (!targetTown) {
            const user = await this.userModel
                .findById(targetUserId)
                .select({ originTown: 1 })
                .lean()
                .exec();
            targetTown = user?.originTown;
        }
        if (!targetTown) {
            return;
        }
        const hasTownSupers = await this.hasSuperMonitorsInTown(targetTown);
        if (!hasTownSupers) {
            return;
        }
        const approverId = String(approver?._id ?? approver?.id ?? '');
        const approverTown = (await this.getMonitorHomeTown(approverId)) ??
            approver?.originTown;
        if (!approverTown || approverTown !== targetTown) {
            throw new common_1.ForbiddenException('You can only approve registrations for your town');
        }
    }
    async findSuperMonitorsByTownForApproval(town) {
        const townProfiles = await this.monitorProfileModel
            .find({ homeTown: town })
            .select({ userId: 1 })
            .lean()
            .exec();
        const ids = townProfiles.map((p) => p.userId);
        if (!ids.length)
            return [];
        const users = await this.userModel
            .find({
            _id: { $in: ids },
            role: user_enum_1.UserRole.Monitor,
            monitorLevel: user_enum_1.MonitorLevel.Super,
            lifecycleStatus: user_enum_1.LifecycleStatus.Active,
        })
            .select({ _id: 1, fullName: 1, email: 1, preferredLanguage: 1 })
            .lean()
            .exec();
        return users.map((u) => ({
            id: String(u._id),
            email: u.email,
            fullName: u.fullName,
            preferredLanguage: u.preferredLanguage,
        }));
    }
    async findAllSuperMonitors() {
        const users = await this.userModel
            .find({
            role: user_enum_1.UserRole.Monitor,
            monitorLevel: user_enum_1.MonitorLevel.Super,
            lifecycleStatus: user_enum_1.LifecycleStatus.Active,
        })
            .select({ _id: 1, fullName: 1, email: 1, preferredLanguage: 1 })
            .lean()
            .exec();
        return users.map((u) => ({
            id: String(u._id),
            email: u.email,
            fullName: u.fullName,
            preferredLanguage: u.preferredLanguage,
        }));
    }
    async hasSuperMonitorsInTown(town) {
        const townProfiles = await this.monitorProfileModel
            .find({ homeTown: town })
            .select({ userId: 1 })
            .lean()
            .exec();
        const ids = townProfiles.map((p) => p.userId);
        if (!ids.length)
            return false;
        const count = await this.userModel
            .countDocuments({
            _id: { $in: ids },
            role: user_enum_1.UserRole.Monitor,
            monitorLevel: user_enum_1.MonitorLevel.Super,
            lifecycleStatus: user_enum_1.LifecycleStatus.Active,
        })
            .exec();
        return count > 0;
    }
    async getMonitorHomeTown(userId) {
        const profile = await this.monitorProfileModel
            .findOne({ userId: new mongoose_2.Types.ObjectId(String(userId)) })
            .select({ homeTown: 1 })
            .lean()
            .exec();
        return profile?.homeTown;
    }
    normalizeUser(user) {
        if (!user) {
            return user;
        }
        const id = user._id ? String(user._id) : undefined;
        const normalized = { ...user, id };
        delete normalized._id;
        delete normalized.__v;
        delete normalized.magicToken;
        delete normalized.magicExpiresAt;
        return normalized;
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __param(1, (0, mongoose_1.InjectModel)(monitor_profile_schema_1.MonitorProfile.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], UsersService);
//# sourceMappingURL=users.service.js.map