import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { MonitorLevel, UserRole } from '../../common/enums/user.enum';

export class RegisterRequestDto {
    @ApiProperty()
    @IsString()
    fullName: string;

    @ApiProperty()
    @IsString()
    phoneE164: string;

    @ApiProperty()
    @IsString()
    email: string;

    @ApiProperty({ enum: UserRole, enumName: 'UserRole' })
    @IsEnum(UserRole)
    role: UserRole;

    @ApiProperty({ enum: MonitorLevel, required: false })
    @IsEnum(MonitorLevel)
    @IsOptional()
    monitorLevel?: MonitorLevel;
}

export class MagicLinkExchangeDto {
    @ApiProperty()
    @IsString()
    token: string;
}

export class RefreshTokenDto {
    @ApiProperty()
    @IsString()
    refreshToken: string;
}

export class AuthTokensResponseDto {
    @ApiProperty()
    accessToken: string;

    @ApiProperty()
    refreshToken: string;
}
