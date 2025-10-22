import { ApiProperty } from '@nestjs/swagger';
import {
    IsEmail,
    IsNotEmpty,
    IsString,
    MinLength,
    IsEnum,
    IsOptional,
} from 'class-validator';
import { Role } from '../../common/enums/role.enum';
import { Region } from '../../common/enums/region.enum';

export class LoginDto {
    @ApiProperty({
        description: 'Monitor email address',
        example: 'john.doe@church.org',
    })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({
        description: 'Monitor password',
        example: 'SecurePass123',
        minLength: 6,
    })
    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    password: string;
}

export class RegisterDto {
    @ApiProperty({
        description: 'Monitor full name',
        example: 'John Doe',
    })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({
        description: 'Monitor email address',
        example: 'john.doe@church.org',
    })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({
        description: 'Monitor phone number',
        example: '+237123456789',
        required: false,
    })
    @IsString()
    @IsOptional()
    phoneNumber?: string;

    @ApiProperty({
        description: 'Monitor password',
        example: 'SecurePass123',
        minLength: 6,
    })
    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    password: string;

    @ApiProperty({
        description: 'Monitor role',
        enum: Role,
        example: Role.MONITOR,
    })
    @IsEnum(Role)
    @IsNotEmpty()
    role: Role;

    @ApiProperty({
        description: 'Assigned town/region',
        enum: Region,
        example: Region.YAOUNDE,
    })
    @IsEnum(Region)
    @IsNotEmpty()
    assignedTown: Region;
}
