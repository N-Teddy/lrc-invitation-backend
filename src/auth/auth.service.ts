import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';
import { UsersService } from '../users/users.service';
import { RegisterRequestDto, GoogleSignInDto } from '../dtos/request/auth.dto';
import { LifecycleStatus, MonitorLevel, UserRole } from '../common/enums/user.enum';
import { NotificationService } from '../notifications/notifications.service';
import { NotificationContextType } from '../common/enums/notification.enum';
import { AppConfigService } from '../config/app-config.service';
import { GoogleService } from '../common/third-party/google.service';

const ACCESS_TOKEN_EXPIRES_IN = '24h';
const REFRESH_TOKEN_EXPIRES_IN = '7d';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
        private readonly notificationService: NotificationService,
        private readonly config: AppConfigService,
        private readonly googleService: GoogleService,
    ) {}

    async register(dto: RegisterRequestDto) {
        if (dto.role === UserRole.Child) {
            throw new BadRequestException('Children are created by staff.');
        }
        if (this.config.notificationProvider === 'email' && !dto.email) {
            throw new BadRequestException('Email is required for registration');
        }
        const isMonitorPending =
            dto.role === UserRole.Monitor &&
            (dto.monitorLevel === MonitorLevel.Aspiring ||
                dto.monitorLevel === MonitorLevel.Official);

        const magicToken = uuidv4();
        const magicExpiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

        const user = await this.usersService.create({
            fullName: dto.fullName,
            role: dto.role,
            monitorLevel: dto.monitorLevel,
            email: dto.email,
            whatsAppPhoneE164: dto.phoneE164,
            lifecycleStatus: undefined,
            preferredLanguage: dto.preferredLanguage,
            originTown: undefined,
            whatsAppOptIn: dto.whatsAppOptIn ?? true,
            registrationPendingApproval: isMonitorPending,
            magicToken,
            magicExpiresAt,
        });

        const magicLinkUrl = this.buildMagicLink(magicToken);
        await this.notificationService.send({
            userId: user.id,
            to: user.email ?? '',
            subject: 'Your sign-in link',
            message: `Hello ${user.fullName},\n\nUse this link to sign in: ${magicLinkUrl}\nThis link expires in 30 minutes.`,
            templateName: 'magic-link',
            templateData: {
                fullName: user.fullName,
                frontendBaseUrl: this.config.frontendBaseUrl,
                token: magicToken,
                magicLink: magicLinkUrl,
                expiresInMinutes: 30,
            },
            contextType: NotificationContextType.Reminder,
            contextId: user.id,
        });

        return { message: 'Magic link sent', userId: user.id };
    }

    async requestMagicLink(email: string) {
        const safeMessage = 'If an account exists for this email, you will receive a sign-in link.';
        if (this.config.notificationProvider === 'email' && !email) {
            throw new BadRequestException('Email is required');
        }

        const normalizedEmail = email.toLowerCase();
        const user = await this.usersService.findByEmail(normalizedEmail);
        if (
            !user ||
            user.role !== UserRole.Monitor ||
            user.lifecycleStatus !== LifecycleStatus.Active ||
            user.registrationPendingApproval
        ) {
            return { message: safeMessage };
        }

        if (!user.email) {
            return { message: safeMessage };
        }

        const magicToken = uuidv4();
        const magicExpiresAt = new Date(Date.now() + 30 * 60 * 1000);
        await this.usersService.setMagicToken(user.id, magicToken, magicExpiresAt);

        const magicLinkUrl = this.buildMagicLink(magicToken);
        await this.notificationService.send({
            userId: user.id,
            to: user.email,
            subject: 'Your sign-in link',
            message: `Hello ${user.fullName},\n\nUse this link to sign in: ${magicLinkUrl}\nThis link expires in 30 minutes.`,
            templateName: 'magic-link',
            templateData: {
                fullName: user.fullName,
                frontendBaseUrl: this.config.frontendBaseUrl,
                token: magicToken,
                magicLink: magicLinkUrl,
                expiresInMinutes: 30,
            },
            contextType: NotificationContextType.Reminder,
            contextId: user.id,
        });

        return { message: safeMessage };
    }

    async exchangeMagicLink(token: string) {
        const user = await this.usersService.findByMagicToken(token);
        if (!user || !user.magicExpiresAt || user.magicExpiresAt.getTime() < Date.now()) {
            throw new UnauthorizedException('Magic link expired or invalid');
        }
        if (user.registrationPendingApproval) {
            throw new UnauthorizedException('Awaiting approval');
        }

        const { accessToken, refreshToken } = await this.generateTokens(
            user.id,
            user.role,
            user.monitorLevel,
        );
        await this.usersService.clearMagicToken(user.id);
        return { accessToken, refreshToken };
    }

    async refresh(refreshToken: string) {
        try {
            const payload = await this.jwtService.verifyAsync(refreshToken, {
                secret: process.env.JWT_REFRESH_SECRET,
            });
            return this.generateTokens(payload.sub, payload.role, payload.monitorLevel);
        } catch {
            throw new UnauthorizedException('Invalid refresh token');
        }
    }

    async revoke(userId: string) {
        // Placeholder: mark refresh tokens invalid for this userId if blacklist is added
        void userId;
        return { success: true };
    }

    async googleSignIn(dto: GoogleSignInDto) {
        const payload = await this.googleService.verifyIdToken(dto.idToken);
        if (!payload?.sub || !payload.email) {
            throw new UnauthorizedException('Invalid Google token');
        }

        let user = await this.usersService.findByGoogleId(payload.sub);
        if (!user) {
            user = await this.usersService.findByEmail(payload.email);
        }

        if (!user) {
            user = await this.usersService.create({
                fullName: payload.name ?? 'Google User',
                role: UserRole.Monitor,
                monitorLevel: MonitorLevel.Aspiring,
                email: payload.email,
                preferredLanguage: payload.locale,
                registrationPendingApproval: true,
                googleId: payload.sub,
                googleEmail: payload.email,
                googleLinkedAt: new Date(),
                whatsAppOptIn: false,
            });
        } else {
            await this.usersService.linkGoogle(user.id, payload.sub, payload.email);
        }

        if (user.registrationPendingApproval) {
            throw new UnauthorizedException('Awaiting approval');
        }

        return this.generateTokens(user.id, user.role, user.monitorLevel);
    }

    private buildMagicLink(token: string): string {
        return `${this.config.frontendBaseUrl}/auth/magic?token=${token}`;
    }

    private async generateTokens(userId: string, role: UserRole, monitorLevel?: MonitorLevel) {
        const payload = { sub: String(userId), role, monitorLevel };
        const accessToken = await this.jwtService.signAsync(payload, {
            secret: this.config.jwtAccessSecret,
            expiresIn: ACCESS_TOKEN_EXPIRES_IN,
        });
        const refreshToken = await this.jwtService.signAsync(payload, {
            secret: this.config.jwtRefreshSecret,
            expiresIn: REFRESH_TOKEN_EXPIRES_IN,
        });
        return { accessToken, refreshToken };
    }
}
