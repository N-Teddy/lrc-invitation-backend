import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schema/user.schema';
import { CreateUserDto, UpdateUserDto } from '../dtos/request/user.dto';

@Injectable()
export class UsersService {
    constructor(@InjectModel(User.name) private readonly userModel: Model<UserDocument>) {}

    async create(dto: CreateUserDto): Promise<User> {
        const user = new this.userModel({
            fullName: dto.fullName,
            role: dto.role,
            monitorLevel: dto.monitorLevel,
            dateOfBirth: dto.dateOfBirth,
            originTown: dto.originTown,
            preferredLanguage: dto.preferredLanguage,
            lifecycleStatus: dto.lifecycleStatus,
            whatsApp: dto.whatsAppPhoneE164
                ? {
                      phoneE164: dto.whatsAppPhoneE164,
                      optIn: dto.whatsAppOptIn ?? true,
                  }
                : undefined,
        });
        return user.save();
    }

    async findAll(): Promise<User[]> {
        return this.userModel.find().exec();
    }

    async findById(id: string): Promise<User | null> {
        return this.userModel.findById(id).exec();
    }

    async findOneOrFail(id: string): Promise<User> {
        const user = await this.findById(id);
        if (!user) {
            throw new NotFoundException('User not found');
        }
        return user;
    }

    async update(id: string, dto: UpdateUserDto): Promise<User> {
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
            .exec();
        if (!user) {
            throw new NotFoundException('User not found');
        }
        return user;
    }

    async remove(id: string): Promise<void> {
        const res = await this.userModel.findByIdAndDelete(id).exec();
        if (!res) {
            throw new NotFoundException('User not found');
        }
    }
}
