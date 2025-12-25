import { HydratedDocument } from 'mongoose';
import { LifecycleStatus, MonitorLevel, UserRole } from '../common/enums/user.enum';
import { Town } from '../common/enums/activity.enum';
export type UserDocument = HydratedDocument<User>;
declare class WhatsAppContact {
    phoneE164?: string;
    optIn?: boolean;
}
declare class ProfileImageRef {
    url?: string;
    provider?: string;
    mimeType?: string;
    sizeBytes?: number;
    updatedAt?: Date;
}
export declare class User {
    fullName: string;
    email?: string;
    role: UserRole;
    monitorLevel?: MonitorLevel;
    dateOfBirth?: Date;
    originTown?: Town;
    preferredLanguage?: string;
    whatsApp?: WhatsAppContact;
    profileImage?: ProfileImageRef;
    registrationPendingApproval?: boolean;
    magicToken?: string;
    magicExpiresAt?: Date;
    googleId?: string;
    googleEmail?: string;
    googleLinkedAt?: Date;
    lifecycleStatus: LifecycleStatus;
    archivedReason?: string;
}
export declare const UserSchema: import("mongoose").Schema<User, import("mongoose").Model<User, any, any, any, import("mongoose").Document<unknown, any, User> & User & {
    _id: import("mongoose").Types.ObjectId;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, User, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<User>> & import("mongoose").FlatRecord<User> & {
    _id: import("mongoose").Types.ObjectId;
}>;
export {};
