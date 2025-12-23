import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { Town } from '../../common/enums/activity.enum';
import { LifecycleStatus, MonitorLevel, UserRole } from '../../common/enums/user.enum';

export class CreateUserDto {
    @ApiProperty()
    @IsString()
    fullName: string;

    @ApiProperty({ enum: UserRole })
    @IsEnum(UserRole)
    role: UserRole;

    @ApiProperty({ enum: MonitorLevel, required: false })
    @IsEnum(MonitorLevel)
    @IsOptional()
    monitorLevel?: MonitorLevel;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    googleId?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    googleEmail?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    googleLinkedAt?: Date;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    email?: string;

    @ApiProperty({ required: false })
    @IsDateString()
    @IsOptional()
    dateOfBirth?: string;

    @ApiProperty({ enum: Town, required: false })
    @IsEnum(Town)
    @IsOptional()
    originTown?: Town;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    preferredLanguage?: string;

    @ApiProperty({ required: false })
    @IsBoolean()
    @IsOptional()
    registrationPendingApproval?: boolean;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    magicToken?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    magicExpiresAt?: Date;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    whatsAppPhoneE164?: string;

    @ApiProperty({ required: false, default: true })
    @IsBoolean()
    @IsOptional()
    whatsAppOptIn?: boolean = true;

    @ApiProperty({ enum: LifecycleStatus, required: false })
    @IsEnum(LifecycleStatus)
    @IsOptional()
    lifecycleStatus?: LifecycleStatus;
}

export class UpdateUserDto extends PartialType(CreateUserDto) {}
