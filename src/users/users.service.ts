import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from '../schema/user.schema';
import { CreateUserData, UpdateUserData } from '../common/interfaces/user-data.interface';
import { v4 as uuidv4 } from 'uuid';
import { UserRole } from '../common/enums/user.enum';

@Injectable()
export class UsersService {
    constructor(@InjectModel(User.name) private readonly userModel: Model<UserDocument>) {}

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
        return this.normalizeUser(saved.toObject());
    }

    async findAll(): Promise<Record<string, any>[]> {
        const users = await this.userModel.find().lean().exec();
        return users.map((user) => this.normalizeUser(user));
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
        return this.normalizeUser(user);
    }

    async updateProfileImage(userId: string, profileImage: Record<string, any>) {
        const user = await this.userModel
            .findByIdAndUpdate(userId, { $set: { profileImage } }, { new: true })
            .lean()
            .exec();
        if (!user) {
            throw new NotFoundException('User not found');
        }
        return this.normalizeUser(user);
    }

    async remove(id: string): Promise<void> {
        const res = await this.userModel.findByIdAndDelete(id).exec();
        if (!res) {
            throw new NotFoundException('User not found');
        }
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
