import { MonitorLevel, UserRole } from '../../common/enums/user.enum';
import { Town } from '../../common/enums/activity.enum';
export declare class RegisterRequestDto {
    fullName: string;
    phoneE164?: string;
    email: string;
    preferredLanguage?: string;
    homeTown?: Town;
    role: UserRole;
    monitorLevel?: MonitorLevel;
    whatsAppOptIn?: boolean;
}
export declare class MagicLinkExchangeDto {
    token: string;
}
export declare class MagicLinkRequestDto {
    email: string;
}
export declare class RefreshTokenDto {
    refreshToken: string;
}
export declare class GoogleSignInDto {
    idToken: string;
}
