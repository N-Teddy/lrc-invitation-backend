import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
	IsNotEmpty,
	IsString,
	IsDateString,
	IsUUID,
	IsEmail,
	IsOptional,
	IsBoolean,
} from 'class-validator';

export class CreateChildRequest {
	@ApiProperty({ example: 'Jane' })
	@IsString()
	@IsNotEmpty()
	firstName: string;

	@ApiProperty({ example: 'Smith' })
	@IsString()
	@IsNotEmpty()
	lastName: string;

	@ApiProperty({ example: '2015-05-20' })
	@IsDateString()
	@IsNotEmpty()
	dateOfBirth: string;

	@ApiProperty()
	@IsUUID()
	@IsNotEmpty()
	townId: string;

	@ApiProperty({ example: 'Mr. Smith' })
	@IsString()
	@IsNotEmpty()
	parentName: string;

	@ApiPropertyOptional({ example: 'parent@example.com' })
	@IsEmail()
	@IsOptional()
	parentEmail?: string;

	@ApiProperty({ example: '+237123456789' })
	@IsString()
	@IsNotEmpty()
	parentPhone: string;

	@ApiPropertyOptional({ example: '+237123456789' })
	@IsString()
	@IsOptional()
	parentWhatsapp?: string;
}

export class UpdateChildRequest {
	@ApiPropertyOptional({ example: 'Jane' })
	@IsString()
	@IsOptional()
	firstName?: string;

	@ApiPropertyOptional({ example: 'Smith' })
	@IsString()
	@IsOptional()
	lastName?: string;

	@ApiPropertyOptional({ example: '2015-05-20' })
	@IsDateString()
	@IsOptional()
	dateOfBirth?: string;

	@ApiPropertyOptional()
	@IsUUID()
	@IsOptional()
	townId?: string;

	@ApiPropertyOptional({ example: 'Mr. Smith' })
	@IsString()
	@IsOptional()
	parentName?: string;

	@ApiPropertyOptional({ example: 'parent@example.com' })
	@IsEmail()
	@IsOptional()
	parentEmail?: string;

	@ApiPropertyOptional({ example: '+237123456789' })
	@IsString()
	@IsOptional()
	parentPhone?: string;

	@ApiPropertyOptional({ example: '+237123456789' })
	@IsString()
	@IsOptional()
	parentWhatsapp?: string;

	@ApiPropertyOptional()
	@IsBoolean()
	@IsOptional()
	isActive?: boolean;
}
