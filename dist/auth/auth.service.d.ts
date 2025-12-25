import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterRequestDto, GoogleSignInDto } from '../dtos/request/auth.dto';
import { NotificationService } from '../notifications/notifications.service';
import { AppConfigService } from '../config/app-config.service';
import { GoogleService } from '../common/third-party/google.service';
export declare class AuthService {
    private readonly usersService;
    private readonly jwtService;
    private readonly notificationService;
    private readonly config;
    private readonly googleService;
    constructor(usersService: UsersService, jwtService: JwtService, notificationService: NotificationService, config: AppConfigService, googleService: GoogleService);
    register(dto: RegisterRequestDto): Promise<{
        message: string;
        userId: any;
    }>;
    private notifySuperMonitorsForApproval;
    requestMagicLink(email: string): Promise<{
        message: string;
    }>;
    exchangeMagicLink(token: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    refresh(refreshToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    revoke(userId: string): Promise<{
        success: boolean;
    }>;
    googleSignIn(dto: GoogleSignInDto): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    private buildMagicLink;
    private generateTokens;
}
