import { Controller, Post, Body, Get, UseGuards, Request, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginRequest, ChangePasswordRequest } from '../../request/auth.request';
import { AuthResponse } from '../../response/auth.response';
import { Public } from '../../common/decorators/public.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { SuccessResponse } from '../../response/common.response';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Public()
	@Post('login')
	@ApiOperation({ summary: 'Login' })
	@ApiResponse({ status: 200, description: 'Login successful', type: AuthResponse })
	async login(@Body() loginRequest: LoginRequest): Promise<AuthResponse> {
		return this.authService.login(loginRequest);
	}

	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@Get('me')
	@ApiOperation({ summary: 'Get current user profile' })
	async getProfile(@Request() req): Promise<SuccessResponse> {
		const profile = await this.authService.getProfile(req.user.id);
		return new SuccessResponse('Profile retrieved successfully', profile);
	}

	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@Patch('change-password')
	@ApiOperation({ summary: 'Change password' })
	async changePassword(
		@Request() req,
		@Body() changePasswordRequest: ChangePasswordRequest
	): Promise<SuccessResponse> {
		await this.authService.changePassword(req.user.id, changePasswordRequest);
		return new SuccessResponse('Password changed successfully');
	}
}
