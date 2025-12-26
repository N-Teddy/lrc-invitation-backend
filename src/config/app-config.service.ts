import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppConfigService {
    constructor(private readonly configService: ConfigService) {}

    get nodeEnv(): string {
        return this.configService.get<string>('NODE_ENV', 'development');
    }

    get isProduction(): boolean {
        return this.nodeEnv === 'production';
    }

    // Expose raw ConfigService only when absolutely needed
    get raw(): ConfigService {
        return this.configService;
    }

    get jwtAccessSecret(): string {
        return this.configService.get<string>('JWT_ACCESS_SECRET', '');
    }

    get jwtRefreshSecret(): string {
        return this.configService.get<string>('JWT_REFRESH_SECRET', '');
    }

    get actionTokenSecret(): string {
        return this.configService.get<string>('ACTION_TOKEN_SECRET', '') || this.jwtRefreshSecret;
    }

    get googleClientId(): string | undefined {
        return this.configService.get<string>('GOOGLE_CLIENT_ID');
    }

    get googleClientSecret(): string | undefined {
        return this.configService.get<string>('GOOGLE_CLIENT_SECRET');
    }

    get appBaseUrl(): string {
        return this.configService.get<string>('APP_BASE_URL', 'http://localhost:3000');
    }

    get frontendBaseUrl(): string {
        const configured = this.configService.get<string>('FRONTEND_BASE_URL');
        const base = configured ?? 'http://localhost:5173';
        return base.replace(/\/$/, '');
    }

    get apiBaseUrl(): string {
        const configured = this.configService.get<string>('API_BASE_URL');
        if (configured) return configured.replace(/\/$/, '');
        return `${this.appBaseUrl.replace(/\/$/, '')}/api`;
    }

    get storageProvider(): 'local' | 'cloudinary' {
        const env = this.nodeEnv;
        const configured = this.configService.get<string>('STORAGE_PROVIDER');
        if (configured === 'local' || configured === 'cloudinary') {
            return configured;
        }
        return env === 'production' ? 'cloudinary' : 'local';
    }

    get storageBaseUrl(): string {
        return this.configService.get<string>('STORAGE_BASE_URL', 'http://localhost:3000/uploads');
    }

    get uploadsDir(): string {
        return this.configService.get<string>('UPLOADS_DIR', 'uploads');
    }

    get cloudinaryCloudName(): string | undefined {
        return this.configService.get<string>('CLOUDINARY_CLOUD_NAME');
    }

    get cloudinaryApiKey(): string | undefined {
        return this.configService.get<string>('CLOUDINARY_API_KEY');
    }

    get cloudinaryApiSecret(): string | undefined {
        return this.configService.get<string>('CLOUDINARY_API_SECRET');
    }

    get notificationProvider(): string {
        return this.configService.get<string>('NOTIFICATION_PROVIDER', 'email');
    }

    get notificationFallbackProvider(): string {
        return this.configService.get<string>('NOTIFICATION_FALLBACK_PROVIDER', 'email');
    }

    get whatsAppEnabled(): boolean {
        return this.configService.get<string>('WHATSAPP_ENABLED', 'false') === 'true';
    }

    get whatsAppPhoneNumberId(): string | undefined {
        return this.configService.get<string>('WHATSAPP_PHONE_NUMBER_ID');
    }

    get whatsAppBusinessAccountId(): string | undefined {
        return this.configService.get<string>('WHATSAPP_BUSINESS_ACCOUNT_ID');
    }

    get whatsAppAccessToken(): string | undefined {
        return this.configService.get<string>('WHATSAPP_ACCESS_TOKEN');
    }

    get inAppNotificationsEnabled(): boolean {
        return this.configService.get<string>('IN_APP_NOTIFICATIONS_ENABLED', 'true') === 'true';
    }

    get mailHost(): string {
        if (!this.isProduction) return 'localhost';
        return this.configService.get<string>('MAIL_HOST', '');
    }

    get mailPort(): number {
        if (!this.isProduction) return 1025;
        return Number(this.configService.get<number>('MAIL_PORT', 465));
    }

    get mailSecure(): boolean {
        if (!this.isProduction) return false;
        const configured = this.configService.get<string>('MAIL_SECURE');
        if (configured === 'true') return true;
        if (configured === 'false') return false;
        return this.mailPort === 465;
    }

    get mailRequireTls(): boolean {
        if (!this.isProduction) return false;
        return this.configService.get<string>('MAIL_REQUIRE_TLS', 'true') !== 'false';
    }

    get mailIgnoreTls(): boolean {
        return !this.isProduction;
    }

    get mailTlsRejectUnauthorized(): boolean {
        if (!this.isProduction) return false;
        return this.configService.get<string>('MAIL_TLS_REJECT_UNAUTHORIZED', 'true') !== 'false';
    }

    get mailUser(): string | undefined {
        if (!this.isProduction) return undefined;
        return this.configService.get<string>('MAIL_USER');
    }

    get mailPass(): string | undefined {
        if (!this.isProduction) return undefined;
        return this.configService.get<string>('MAIL_PASS');
    }

    get mailFrom(): string {
        return this.configService.get<string>(
            'MAIL_FROM',
            'LRC Jeunesse <no-reply@lrc-jeunesse.local>',
        );
    }

    get authMode(): 'magic_link' | 'direct_email' {
        const configured = this.configService.get<string>('AUTH_MODE', 'magic_link');
        if (configured === 'direct_email' || configured === 'magic_link') return configured;
        return 'magic_link';
    }
}
