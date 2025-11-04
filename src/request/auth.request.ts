import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginRequest {
	@ApiProperty({ example: 'monitor@example.com' })
	@IsEmail()
	@IsNotEmpty()
	email: string;

	@ApiProperty({ example: 'password123' })
	@IsString()
	@IsNotEmpty()
	password: string;
}

export class ChangePasswordRequest {
	@ApiProperty()
	@IsString()
	@IsNotEmpty()
	currentPassword: string;

	@ApiProperty()
	@IsString()
	@MinLength(6)
	@IsNotEmpty()
	newPassword: string;
}
