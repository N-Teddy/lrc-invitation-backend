import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsString,
    IsEmail,
    IsEnum,
    IsOptional,
    IsBoolean,
    IsNumber,
    Min,
    MinLength,
    Matches,
} from 'class-validator';
import { Role } from '../../common/enums/role.enum';
import { Region } from '../../common/enums/region.enum';

export class CreateMonitorDto {
    @ApiProperty({ example: 'John Doe' })
    @IsString()
    fullName: string;

    @ApiProperty({ example: 'john.doe@example.com' })
    @IsEmail()
    email: string;

    @ApiProperty({ example: 'SecurePass123!' })
    @IsString()
    @MinLength(8)
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
        message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
    })
    password: string;

    @ApiProperty({ example: '+237612345678' })
    @IsString()
    phoneNumber: string;

    @ApiProperty({ enum: Role, example: Role.MONITOR })
    @IsEnum(Role)
    role: Role;

    @ApiProperty({ enum: Region, example: Region.YAOUNDE })
    @IsEnum(Region)
    assignedTown: Region;

    @ApiPropertyOptional({ example: true })
    @IsOptional()
    @IsBoolean()
    yearlyFeePaid?: boolean;

    @ApiPropertyOptional({ example: 5000 })
    @IsOptional()
    @IsNumber()
    yearlyFeeAmount?: number;
}

export class UpdateMonitorDto {
    @ApiPropertyOptional({ example: 'John Doe' })
    @IsOptional()
    @IsString()
    fullName?: string;

    @ApiPropertyOptional({ example: 'john.doe@example.com' })
    @IsOptional()
    @IsEmail()
    email?: string;

    @ApiPropertyOptional({ example: '+237612345678' })
    @IsOptional()
    @IsString()
    phoneNumber?: string;

    @ApiPropertyOptional({ enum: Role, example: Role.MONITOR })
    @IsOptional()
    @IsEnum(Role)
    role?: Role;

    @ApiPropertyOptional({ enum: Region, example: Region.YAOUNDE })
    @IsOptional()
    @IsEnum(Region)
    assignedTown?: Region;
}

export class UpdateMonitorPasswordDto {
    @ApiProperty({ example: 'CurrentPass123!' })
    @IsString()
    currentPassword: string;

    @ApiProperty({ example: 'NewSecurePass123!' })
    @IsString()
    @MinLength(8)
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
        message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
    })
    newPassword: string;
}

export class UpdateYearlyFeeDto {
    @ApiProperty({ example: true })
    @IsBoolean()
    paid: boolean;

    @ApiPropertyOptional({ example: 5000 })
    @IsOptional()
    @IsNumber()
    amount?: number;
}
