import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';
import { MonitorLevel, UserRole } from '../../common/enums/user.enum';
import { Town } from '../../common/enums/activity.enum';

export class RegisterRequestDto {
    @ApiProperty()
    @IsString()
    fullName: string;

    @ApiProperty({ required: false, description: 'Optional for email-only environments' })
    @IsString()
    @IsOptional()
    phoneE164?: string;

    @ApiProperty()
    @IsEmail()
    email: string;

    @ApiProperty({
        required: false,
        description: 'Preferred UI/notification language (e.g., en, fr)',
    })
    @IsString()
    @IsOptional()
    preferredLanguage?: string;

    @ApiProperty({
        enum: Town,
        required: false,
        description: 'Required for monitors; used for town scoping and approvals',
    })
    @IsEnum(Town)
    @IsOptional()
    homeTown?: Town;

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

export class MagicLinkRequestDto {
    @ApiProperty()
    @IsEmail()
    email: string;
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
