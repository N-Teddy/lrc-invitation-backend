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
import { Town } from '../common/enums/activity.enum';
import { SettingsService } from '../settings/settings.service';

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
        private readonly settingsService: SettingsService,
    ) {}

    async register(dto: RegisterRequestDto) {
        if (dto.role === UserRole.Child) {
            throw new BadRequestException('Children are created by staff.');
        }
        if (this.config.notificationProvider === 'email' && !dto.email) {
            throw new BadRequestException('Email is required for registration');
        }
        if (dto.role === UserRole.Monitor && !dto.homeTown) {
            throw new BadRequestException('homeTown is required for monitor registration');
        }
        const monitorLevel =
            dto.role === UserRole.Monitor ? (dto.monitorLevel ?? MonitorLevel.Aspiring) : undefined;

        if (dto.role === UserRole.Monitor && monitorLevel === MonitorLevel.Super) {
            throw new BadRequestException('Super monitor cannot be self-registered');
        }

        const isMonitorPending = dto.role === UserRole.Monitor;

        const magicToken = uuidv4();
        const magicExpiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

        const user = await this.usersService.create({
            fullName: dto.fullName,
            role: dto.role,
            monitorLevel,
            email: dto.email,
            whatsAppPhoneE164: dto.phoneE164,
            lifecycleStatus: undefined,
            preferredLanguage: dto.preferredLanguage,
            originTown: dto.homeTown,
            homeTown: dto.homeTown,
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

        if (isMonitorPending && dto.homeTown) {
            await this.notifySuperMonitorsForApproval(user, dto.homeTown);
        }

        return { message: 'Magic link sent', userId: user.id };
    }

    private async notifySuperMonitorsForApproval(user: Record<string, any>, town: Town) {
        const townSupers = await this.usersService.findSuperMonitorsByTownForApproval(town);
        const recipients = townSupers.length
            ? townSupers
            : await this.usersService.findAllSuperMonitors();

        const appUrl = `${this.config.frontendBaseUrl}/admin/users?pending=true&userId=${encodeURIComponent(
            String(user.id),
        )}`;

        const subject = `Approval needed: ${user.fullName} (${town})`;
        const message =
            `A new monitor registration is awaiting approval.\n\n` +
            `Name: ${user.fullName}\n` +
            `Email: ${user.email ?? '—'}\n` +
            `Town: ${town}\n\n` +
            `Open approvals: ${appUrl}`;

        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        await Promise.all(
            recipients
                .filter((r) => !!r.email)
                .map((r) =>
                    this.notificationService.send({
                        userId: r.id,
                        to: r.email ?? '',
                        subject,
                        message,
                        templateName: 'monitor-registration-approval',
                        templateData: {
                            approverName: r.fullName,
                            registrantName: user.fullName,
                            registrantEmail: user.email ?? '',
                            town,
                            approvalsUrl: appUrl,
                        },
                        actions: [
                            {
                                id: 'OPEN_APPROVALS',
                                label: 'Open approvals',
                                redirectUrl: appUrl,
                            },
                        ],
                        conversation: {
                            state: 'approval_request',
                            allowedResponses: ['OPEN_APPROVALS'],
                            expiresAt,
                        },
                        contextType: NotificationContextType.Reminder,
                        contextId: `registration_approval:${String(user.id)}`,
                    }),
                ),
        );
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

    getAuthMode() {
        return this.settingsService.getAuthMode();
    }

    async directEmailLogin(email: string) {
        const { mode } = await this.settingsService.getAuthMode();
        if (mode !== 'direct_email') {
            throw new BadRequestException('Direct email login is disabled');
        }
        if (!email) throw new BadRequestException('Email is required');

        const normalizedEmail = email.toLowerCase();
        const user = await this.usersService.findByEmail(normalizedEmail);
        if (
            !user ||
            user.role !== UserRole.Monitor ||
            user.lifecycleStatus !== LifecycleStatus.Active
        ) {
            throw new UnauthorizedException('Invalid credentials');
        }
        if (user.registrationPendingApproval) {
            throw new UnauthorizedException('Awaiting approval');
        }

        const { accessToken, refreshToken } = await this.generateTokens(
            user.id,
            user.role,
            user.monitorLevel,
        );
        return { accessToken, refreshToken };
    }

    async exchangeMagicLink(token: string) {
        const user = await this.usersService.findByMagicTokenForAuth(token);
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
