import { ApiProperty } from '@nestjs/swagger';

export class AuthTokensResponseDto {
    @ApiProperty()
    accessToken: string;

    @ApiProperty()
    refreshToken: string;
}

export class RegisterResponseDto {
    @ApiProperty()
    message: string;

    @ApiProperty()
    userId: string;
}

export class MagicLinkRequestResponseDto {
    @ApiProperty()
    message: string;
}

export class AuthModeResponseDto {
    @ApiProperty({ enum: ['magic_link', 'direct_email'] })
    mode: 'magic_link' | 'direct_email';
}
