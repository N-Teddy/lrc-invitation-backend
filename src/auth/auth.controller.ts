import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserResponseDto } from '../dtos/response/user.dto';
import {
    RegisterRequestDto,
    MagicLinkExchangeDto,
    RefreshTokenDto,
    AuthTokensResponseDto,
} from './dto/auth.dto';
import { AuthService } from './auth.service';
import { Public } from '../common/decorators/public.decorator';
import { GoogleSignInDto } from './dto/google.dto';

@ApiTags('auth')
@ApiBearerAuth()
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Public()
    @Post('register')
    register(@Body() dto: RegisterRequestDto) {
        return this.authService.register(dto);
    }

    @Public()
    @Post('magic/exchange')
    @ApiOkResponse({ type: AuthTokensResponseDto })
    exchange(@Body() dto: MagicLinkExchangeDto) {
        return this.authService.exchangeMagicLink(dto.token);
    }

    @Public()
    @Post('refresh')
    @ApiOkResponse({ type: AuthTokensResponseDto })
    refresh(@Body() dto: RefreshTokenDto) {
        return this.authService.refresh(dto.refreshToken);
    }

    @Public()
    @Post('google')
    @ApiOkResponse({ type: AuthTokensResponseDto })
    google(@Body() dto: GoogleSignInDto) {
        return this.authService.googleSignIn(dto);
    }

    @Get('me')
    @ApiOkResponse({ type: UserResponseDto })
    me(@CurrentUser() user: any): UserResponseDto {
        return user;
    }
}
