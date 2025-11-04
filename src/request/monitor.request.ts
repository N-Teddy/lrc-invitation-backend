import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
	IsEmail,
	IsNotEmpty,
	IsString,
	IsOptional,
	IsUUID,
	IsEnum,
	MinLength,
	IsBoolean,
} from 'class-validator';
import { Role } from '../common/enums/role.enum';

export class CreateMonitorRequest {
	@ApiProperty({ example: 'John' })
	@IsString()
	@IsNotEmpty()
	firstName: string;

	@ApiProperty({ example: 'Doe' })
	@IsString()
	@IsNotEmpty()
	lastName: string;

	@ApiProperty({ example: 'john.doe@example.com' })
	@IsEmail()
	@IsNotEmpty()
	email: string;

	@ApiProperty({ example: 'password123' })
	@IsString()
	@MinLength(6)
	@IsNotEmpty()
	password: string;

	@ApiProperty({ example: '+237123456789' })
	@IsString()
	@IsNotEmpty()
	phone: string;

	@ApiPropertyOptional({ example: '+237123456789' })
	@IsString()
	@IsOptional()
	whatsappNumber?: string;

	@ApiPropertyOptional({ enum: Role, example: Role.MONITOR })
	@IsEnum(Role)
	@IsOptional()
	role?: Role;

	@ApiPropertyOptional()
	@IsUUID()
	@IsOptional()
	townId?: string;
}

export class UpdateMonitorRequest {
	@ApiPropertyOptional({ example: 'John' })
	@IsString()
	@IsOptional()
	firstName?: string;

	@ApiPropertyOptional({ example: 'Doe' })
	@IsString()
	@IsOptional()
	lastName?: string;

	@ApiPropertyOptional({ example: 'john.doe@example.com' })
	@IsEmail()
	@IsOptional()
	email?: string;

	@ApiPropertyOptional({ example: '+237123456789' })
	@IsString()
	@IsOptional()
	phone?: string;

	@ApiPropertyOptional({ example: '+237123456789' })
	@IsString()
	@IsOptional()
	whatsappNumber?: string;

	@ApiPropertyOptional()
	@IsUUID()
	@IsOptional()
	townId?: string;

	@ApiPropertyOptional()
	@IsBoolean()
	@IsOptional()
	isActive?: boolean;
}
