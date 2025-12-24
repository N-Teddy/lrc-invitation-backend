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
