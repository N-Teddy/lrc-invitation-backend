import { UserResponseDto } from '../dtos/response/user.dto';
import { RegisterRequestDto, MagicLinkExchangeDto, MagicLinkRequestDto, RefreshTokenDto, GoogleSignInDto } from '../dtos/request/auth.dto';
import { AuthService } from './auth.service';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(dto: RegisterRequestDto): Promise<{
        message: string;
        userId: any;
    }>;
    requestMagicLink(dto: MagicLinkRequestDto): Promise<{
        message: string;
    }>;
    exchange(dto: MagicLinkExchangeDto): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    refresh(dto: RefreshTokenDto): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    google(dto: GoogleSignInDto): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    me(user: any): UserResponseDto;
}
