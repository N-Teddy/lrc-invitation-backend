import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
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

    @ApiProperty({ required: false, default: true })
    @IsBoolean()
    @IsOptional()
    whatsAppOptIn?: boolean = true;
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

export class GoogleSignInDto {
    @ApiProperty()
    @IsString()
    idToken: string;
}
