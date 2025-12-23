import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from '../schema/user.schema';
import { CreateUserDto, UpdateUserDto } from '../dtos/request/user.dto';

@Injectable()
export class UsersService {
    constructor(@InjectModel(User.name) private readonly userModel: Model<UserDocument>) {}

    async create(dto: CreateUserDto): Promise<Record<string, any>> {
        const user = new this.userModel({
            fullName: dto.fullName,
            role: dto.role,
            monitorLevel: dto.monitorLevel,
            email: dto.email?.toLowerCase(),
            googleId: dto.googleId,
            googleEmail: dto.googleEmail,
            googleLinkedAt: dto.googleLinkedAt,
            dateOfBirth: dto.dateOfBirth,
            originTown: dto.originTown,
            preferredLanguage: dto.preferredLanguage,
            lifecycleStatus: dto.lifecycleStatus,
            registrationPendingApproval: dto.registrationPendingApproval,
            magicToken: dto.magicToken,
            magicExpiresAt: dto.magicExpiresAt,
            whatsApp: dto.whatsAppPhoneE164
                ? {
                      phoneE164: dto.whatsAppPhoneE164,
                      optIn: dto.whatsAppOptIn ?? true,
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

    async update(id: string, dto: UpdateUserDto): Promise<Record<string, any>> {
        const user = await this.userModel
            .findByIdAndUpdate(
                id,
                {
                    $set: {
                        ...dto,
                        whatsApp: dto.whatsAppPhoneE164
                            ? {
                                  phoneE164: dto.whatsAppPhoneE164,
                                  optIn: dto.whatsAppOptIn ?? true,
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

    async remove(id: string): Promise<void> {
        const res = await this.userModel.findByIdAndDelete(id).exec();
        if (!res) {
            throw new NotFoundException('User not found');
        }
    }

    private normalizeUser(user: Record<string, any>): Record<string, any> {
        if (!user) {
            return user;
        }
        const id = user._id ? String(user._id) : undefined;
        return { ...user, id };
    }
}
