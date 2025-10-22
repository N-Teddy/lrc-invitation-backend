import { ApiProperty } from '@nestjs/swagger';
import {
    IsString,
    IsEmail,
    IsEnum,
    IsOptional,
    IsBoolean,
    IsNumber,
    Min,
} from 'class-validator';
import { Role } from '../../common/enums/role.enum';
import { Region } from '../../common/enums/region.enum';

export class CreateMonitorDto {
    @ApiProperty({ description: 'Monitor name', example: 'Jane Smith' })
    @IsString()
    name: string;

    @ApiProperty({ description: 'Monitor email', example: 'jane@church.org' })
    @IsEmail()
    email: string;

    @ApiProperty({
        description: 'Phone number',
        example: '+237123456789',
        required: false,
    })
    @IsString()
    @IsOptional()
    phoneNumber?: string;

    @ApiProperty({ description: 'Monitor role', enum: Role })
    @IsEnum(Role)
    role: Role;

    @ApiProperty({ description: 'Assigned town', enum: Region })
    @IsEnum(Region)
    assignedTown: Region;
}

export class UpdateMonitorDto {
    @ApiProperty({ description: 'Monitor name', required: false })
    @IsString()
    @IsOptional()
    name?: string;

    @ApiProperty({ description: 'Phone number', required: false })
    @IsString()
    @IsOptional()
    phoneNumber?: string;

    @ApiProperty({ description: 'Monitor role', enum: Role, required: false })
    @IsEnum(Role)
    @IsOptional()
    role?: Role;

    @ApiProperty({ description: 'Assigned town', enum: Region, required: false })
    @IsEnum(Region)
    @IsOptional()
    assignedTown?: Region;

    @ApiProperty({ description: 'Yearly fee paid status', required: false })
    @IsBoolean()
    @IsOptional()
    yearlyFeePaid?: boolean;

    @ApiProperty({ description: 'Yearly fee amount', required: false })
    @IsNumber()
    @Min(0)
    @IsOptional()
    yearlyFeeAmount?: number;
}
