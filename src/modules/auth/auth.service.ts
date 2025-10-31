import {
    Injectable,
    UnauthorizedException,
    ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Monitor } from '../../entities/monitor.entity';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';
import { LoginDto, RegisterDto } from 'src/dto/request/auth.dto';
import { AuthResponseDto } from 'src/dto/response/auth.dto';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(Monitor)
        private readonly monitorRepository: Repository<Monitor>,
        private readonly jwtService: JwtService,
    ) { }

    /**
     * Register a new monitor
     */
    async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
        const { email, password, name, phoneNumber, role, assignedTown } =
            registerDto;

        // Check if email already exists
        const existingMonitor = await this.monitorRepository.findOne({
            where: { email },
        });

        if (existingMonitor) {
            throw new ConflictException('Email already exists');
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Create monitor
        const monitor = this.monitorRepository.create({
            email,
            passwordHash,
            name,
            phoneNumber,
            role,
            region: assignedTown,
        });

        await this.monitorRepository.save(monitor);

        // Generate token
        const token = this.generateToken(monitor);

        return {
            accessToken: token,
            monitor: {
                id: monitor.id,
                name: monitor.name,
                email: monitor.email,
                role: monitor.role,
                assignedTown: monitor.region,
            },
        };
    }

    /**
     * Login a monitor
     */
    async login(loginDto: LoginDto): Promise<AuthResponseDto> {
        const { email, password } = loginDto;

        // Find monitor
        const monitor = await this.monitorRepository.findOne({
            where: { email },
        });

        if (!monitor) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, monitor.passwordHash);

        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // Generate token
        const token = this.generateToken(monitor);

        return {
            accessToken: token,
            monitor: {
                id: monitor.id,
                name: monitor.name,
                email: monitor.email,
                role: monitor.role,
                assignedTown: monitor.region,
            },
        };
    }

    /**
     * Validate monitor by ID (used by JWT strategy)
     */
    async validateMonitor(monitorId: number): Promise<Monitor> {
        const monitor = await this.monitorRepository.findOne({
            where: { id: monitorId },
        });

        if (!monitor) {
            throw new UnauthorizedException('Monitor not found');
        }

        return monitor;
    }

    /**
     * Generate JWT token
     */
    private generateToken(monitor: Monitor): string {
        const payload: JwtPayload = {
            sub: monitor.id,
            email: monitor.email,
            role: monitor.role,
            assignedTown: monitor.region,
        };

        return this.jwtService.sign(payload);
    }
}
