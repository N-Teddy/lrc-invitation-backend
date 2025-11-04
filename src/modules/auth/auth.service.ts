import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Monitor } from '../../entities/monitor.entity';
import { LoginRequest, ChangePasswordRequest } from '../../request/auth.request';
import { AuthResponse } from '../../response/auth.response';
import { BusinessException } from '../../common/exceptions/business.exception';

@Injectable()
export class AuthService {
	constructor(
		@InjectRepository(Monitor)
		private monitorRepository: Repository<Monitor>,
		private jwtService: JwtService
	) {}

	async login(loginRequest: LoginRequest): Promise<AuthResponse> {
		const monitor = await this.monitorRepository.findOne({
			where: { email: loginRequest.email },
			select: [
				'id',
				'email',
				'password',
				'firstName',
				'lastName',
				'role',
				'townId',
				'isActive',
			],
		});

		if (!monitor || !monitor.isActive) {
			throw new UnauthorizedException('Invalid credentials');
		}

		const isPasswordValid = await bcrypt.compare(loginRequest.password, monitor.password);

		if (!isPasswordValid) {
			throw new UnauthorizedException('Invalid credentials');
		}

		const payload = { email: monitor.email, sub: monitor.id, role: monitor.role };
		const accessToken = this.jwtService.sign(payload);

		return new AuthResponse(accessToken, monitor);
	}

	async changePassword(
		userId: string,
		changePasswordRequest: ChangePasswordRequest
	): Promise<void> {
		const monitor = await this.monitorRepository.findOne({
			where: { id: userId },
			select: ['id', 'password'],
		});

		if (!monitor) {
			throw new BusinessException('Monitor not found');
		}

		const isCurrentPasswordValid = await bcrypt.compare(
			changePasswordRequest.currentPassword,
			monitor.password
		);

		if (!isCurrentPasswordValid) {
			throw new BusinessException('Current password is incorrect');
		}

		const hashedPassword = await bcrypt.hash(changePasswordRequest.newPassword, 10);
		await this.monitorRepository.update(userId, { password: hashedPassword });
	}

	async getProfile(userId: string): Promise<any> {
		const monitor = await this.monitorRepository.findOne({
			where: { id: userId },
			relations: ['town'],
		});

		if (!monitor) {
			throw new BusinessException('Monitor not found');
		}

		return {
			id: monitor.id,
			email: monitor.email,
			firstName: monitor.firstName,
			lastName: monitor.lastName,
			phone: monitor.phone,
			whatsappNumber: monitor.whatsappNumber,
			role: monitor.role,
			townId: monitor.townId,
			townName: monitor.town?.name,
			isActive: monitor.isActive,
		};
	}
}
