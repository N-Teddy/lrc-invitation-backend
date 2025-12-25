import { Town } from '../enums/activity.enum';
import { LifecycleStatus, MonitorLevel, UserRole } from '../enums/user.enum';
export interface CreateUserData {
    fullName: string;
    role: UserRole;
    monitorLevel?: MonitorLevel;
    email?: string;
    dateOfBirth?: string;
    originTown?: Town;
    homeTown?: Town;
    preferredLanguage?: string;
    lifecycleStatus?: LifecycleStatus;
    whatsAppPhoneE164?: string;
    whatsAppOptIn?: boolean;
    registrationPendingApproval?: boolean;
    magicToken?: string;
    magicExpiresAt?: Date;
    googleId?: string;
    googleEmail?: string;
    googleLinkedAt?: Date;
}
export type UpdateUserData = Partial<CreateUserData>;
