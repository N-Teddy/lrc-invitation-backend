import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { LifecycleStatus, MonitorLevel, UserRole } from '../common/enums/user.enum';
import { Town } from '../common/enums/activity.enum';

export type UserDocument = HydratedDocument<User>;

@Schema({ _id: false })
class WhatsAppContact {
    @Prop({ trim: true })
    phoneE164?: string;

    @Prop({ default: true })
    optIn?: boolean;
}

@Schema({ _id: false })
class ProfileImageRef {
    @Prop()
    url?: string;

    @Prop()
    provider?: string;

    @Prop()
    mimeType?: string;

    @Prop()
    sizeBytes?: number;

    @Prop()
    updatedAt?: Date;
}

@Schema({ timestamps: true })
export class User {
    @Prop({ required: true, trim: true })
    fullName: string;

    @Prop({ type: String, enum: UserRole, required: true })
    role: UserRole;

    @Prop({ type: String, enum: MonitorLevel })
    monitorLevel?: MonitorLevel;

    @Prop()
    dateOfBirth?: Date;

    @Prop({ type: String, enum: Town })
    originTown?: Town;

    @Prop({ trim: true })
    preferredLanguage?: string;

    @Prop({ type: WhatsAppContact })
    whatsApp?: WhatsAppContact;

    @Prop({ type: ProfileImageRef })
    profileImage?: ProfileImageRef;

    @Prop({ type: String, enum: LifecycleStatus, default: LifecycleStatus.Active })
    lifecycleStatus: LifecycleStatus;

    @Prop()
    archivedReason?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.index({ role: 1 });
UserSchema.index({ originTown: 1 });
UserSchema.index({ preferredLanguage: 1 });
UserSchema.index({ lifecycleStatus: 1 });
UserSchema.index({ 'whatsApp.phoneE164': 1 }, { unique: false });
