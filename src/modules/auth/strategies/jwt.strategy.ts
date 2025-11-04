import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Repository } from 'typeorm';
import { Monitor } from '../../../entities/monitor.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(
		private configService: ConfigService,
		@InjectRepository(Monitor)
		private monitorRepository: Repository<Monitor>
	) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: false,
			secretOrKey: configService.get('JWT_SECRET'),
		});
	}

	async validate(payload: any) {
		const monitor = await this.monitorRepository.findOne({
			where: { id: payload.sub, isActive: true },
			relations: ['town'],
		});

		if (!monitor) {
			throw new UnauthorizedException('Invalid token');
		}

		return {
			id: monitor.id,
			email: monitor.email,
			role: monitor.role,
			townId: monitor.townId,
			firstName: monitor.firstName,
			lastName: monitor.lastName,
		};
	}
}
