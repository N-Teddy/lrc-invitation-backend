"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const uuid_1 = require("uuid");
const users_service_1 = require("../users/users.service");
const user_enum_1 = require("../common/enums/user.enum");
const notifications_service_1 = require("../notifications/notifications.service");
const notification_enum_1 = require("../common/enums/notification.enum");
const app_config_service_1 = require("../config/app-config.service");
const google_service_1 = require("../common/third-party/google.service");
const ACCESS_TOKEN_EXPIRES_IN = '24h';
const REFRESH_TOKEN_EXPIRES_IN = '7d';
let AuthService = class AuthService {
    constructor(usersService, jwtService, notificationService, config, googleService) {
        this.usersService = usersService;
        this.jwtService = jwtService;
        this.notificationService = notificationService;
        this.config = config;
        this.googleService = googleService;
    }
    async register(dto) {
        if (dto.role === user_enum_1.UserRole.Child) {
            throw new common_1.BadRequestException('Children are created by staff.');
        }
        if (this.config.notificationProvider === 'email' && !dto.email) {
            throw new common_1.BadRequestException('Email is required for registration');
        }
        if (dto.role === user_enum_1.UserRole.Monitor && !dto.homeTown) {
            throw new common_1.BadRequestException('homeTown is required for monitor registration');
        }
        const monitorLevel = dto.role === user_enum_1.UserRole.Monitor ? (dto.monitorLevel ?? user_enum_1.MonitorLevel.Aspiring) : undefined;
        if (dto.role === user_enum_1.UserRole.Monitor && monitorLevel === user_enum_1.MonitorLevel.Super) {
            throw new common_1.BadRequestException('Super monitor cannot be self-registered');
        }
        const isMonitorPending = dto.role === user_enum_1.UserRole.Monitor;
        const magicToken = (0, uuid_1.v4)();
        const magicExpiresAt = new Date(Date.now() + 30 * 60 * 1000);
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
            contextType: notification_enum_1.NotificationContextType.Reminder,
            contextId: user.id,
        });
        if (isMonitorPending && dto.homeTown) {
            await this.notifySuperMonitorsForApproval(user, dto.homeTown);
        }
        return { message: 'Magic link sent', userId: user.id };
    }
    async notifySuperMonitorsForApproval(user, town) {
        const townSupers = await this.usersService.findSuperMonitorsByTownForApproval(town);
        const recipients = townSupers.length
            ? townSupers
            : await this.usersService.findAllSuperMonitors();
        const appUrl = `${this.config.frontendBaseUrl}/admin/users?pending=true&userId=${encodeURIComponent(String(user.id))}`;
        const subject = `Approval needed: ${user.fullName} (${town})`;
        const message = `A new monitor registration is awaiting approval.\n\n` +
            `Name: ${user.fullName}\n` +
            `Email: ${user.email ?? '—'}\n` +
            `Town: ${town}\n\n` +
            `Open approvals: ${appUrl}`;
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        await Promise.all(recipients
            .filter((r) => !!r.email)
            .map((r) => this.notificationService.send({
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
            contextType: notification_enum_1.NotificationContextType.Reminder,
            contextId: `registration_approval:${String(user.id)}`,
        })));
    }
    async requestMagicLink(email) {
        const safeMessage = 'If an account exists for this email, you will receive a sign-in link.';
        if (this.config.notificationProvider === 'email' && !email) {
            throw new common_1.BadRequestException('Email is required');
        }
        const normalizedEmail = email.toLowerCase();
        const user = await this.usersService.findByEmail(normalizedEmail);
        if (!user ||
            user.role !== user_enum_1.UserRole.Monitor ||
            user.lifecycleStatus !== user_enum_1.LifecycleStatus.Active ||
            user.registrationPendingApproval) {
            return { message: safeMessage };
        }
        if (!user.email) {
            return { message: safeMessage };
        }
        const magicToken = (0, uuid_1.v4)();
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
            contextType: notification_enum_1.NotificationContextType.Reminder,
            contextId: user.id,
        });
        return { message: safeMessage };
    }
    async exchangeMagicLink(token) {
        const user = await this.usersService.findByMagicTokenForAuth(token);
        if (!user || !user.magicExpiresAt || user.magicExpiresAt.getTime() < Date.now()) {
            throw new common_1.UnauthorizedException('Magic link expired or invalid');
        }
        if (user.registrationPendingApproval) {
            throw new common_1.UnauthorizedException('Awaiting approval');
        }
        const { accessToken, refreshToken } = await this.generateTokens(user.id, user.role, user.monitorLevel);
        await this.usersService.clearMagicToken(user.id);
        return { accessToken, refreshToken };
    }
    async refresh(refreshToken) {
        try {
            const payload = await this.jwtService.verifyAsync(refreshToken, {
                secret: process.env.JWT_REFRESH_SECRET,
            });
            return this.generateTokens(payload.sub, payload.role, payload.monitorLevel);
        }
        catch {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
    }
    async revoke(userId) {
        void userId;
        return { success: true };
    }
    async googleSignIn(dto) {
        const payload = await this.googleService.verifyIdToken(dto.idToken);
        if (!payload?.sub || !payload.email) {
            throw new common_1.UnauthorizedException('Invalid Google token');
        }
        let user = await this.usersService.findByGoogleId(payload.sub);
        if (!user) {
            user = await this.usersService.findByEmail(payload.email);
        }
        if (!user) {
            user = await this.usersService.create({
                fullName: payload.name ?? 'Google User',
                role: user_enum_1.UserRole.Monitor,
                monitorLevel: user_enum_1.MonitorLevel.Aspiring,
                email: payload.email,
                preferredLanguage: payload.locale,
                registrationPendingApproval: true,
                googleId: payload.sub,
                googleEmail: payload.email,
                googleLinkedAt: new Date(),
                whatsAppOptIn: false,
            });
        }
        else {
            await this.usersService.linkGoogle(user.id, payload.sub, payload.email);
        }
        if (user.registrationPendingApproval) {
            throw new common_1.UnauthorizedException('Awaiting approval');
        }
        return this.generateTokens(user.id, user.role, user.monitorLevel);
    }
    buildMagicLink(token) {
        return `${this.config.frontendBaseUrl}/auth/magic?token=${token}`;
    }
    async generateTokens(userId, role, monitorLevel) {
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
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        jwt_1.JwtService,
        notifications_service_1.NotificationService,
        app_config_service_1.AppConfigService,
        google_service_1.GoogleService])
], AuthService);
//# sourceMappingURL=auth.service.js.map