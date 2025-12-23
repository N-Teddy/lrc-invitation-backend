import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppConfigService {
    constructor(private readonly configService: ConfigService) {}

    get jwtAccessSecret(): string {
        return this.configService.get<string>('JWT_ACCESS_SECRET', '');
    }

    get jwtRefreshSecret(): string {
        return this.configService.get<string>('JWT_REFRESH_SECRET', '');
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

    get notificationProvider(): string {
        return this.configService.get<string>('NOTIFICATION_PROVIDER', 'email');
    }

    get mailHost(): string {
        return this.configService.get<string>('MAIL_HOST', 'localhost');
    }

    get mailPort(): number {
        return Number(this.configService.get<number>('MAIL_PORT', 1025));
    }

    get mailUser(): string | undefined {
        return this.configService.get<string>('MAIL_USER');
    }

    get mailPass(): string | undefined {
        return this.configService.get<string>('MAIL_PASS');
    }

    get mailFrom(): string {
        return this.configService.get<string>(
            'MAIL_FROM',
            'LRC Jeunesse <no-reply@lrc-jeunesse.local>',
        );
    }
}
