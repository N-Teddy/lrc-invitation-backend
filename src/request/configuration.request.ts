import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class UpdateConfigurationRequest {
	@ApiProperty({ example: '6' })
	@IsString()
	@IsNotEmpty()
	value: string;

	@ApiPropertyOptional({ example: 'Number of months before birthday for age promotion' })
	@IsString()
	@IsOptional()
	description?: string;
}
