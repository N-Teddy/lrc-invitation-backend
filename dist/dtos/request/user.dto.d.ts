import { Town } from '../../common/enums/activity.enum';
import { LifecycleStatus, MonitorLevel, UserRole } from '../../common/enums/user.enum';
export declare class CreateUserDto {
    fullName: string;
    role: UserRole;
    monitorLevel?: MonitorLevel;
    email?: string;
    dateOfBirth?: string;
    originTown?: Town;
    preferredLanguage?: string;
    whatsAppPhoneE164?: string;
    whatsAppOptIn?: boolean;
    lifecycleStatus?: LifecycleStatus;
}
declare const UpdateUserDto_base: import("@nestjs/common").Type<Partial<CreateUserDto>>;
export declare class UpdateUserDto extends UpdateUserDto_base {
}
export declare class UpdateMyPreferencesDto {
    preferredLanguage?: string;
}
export {};
