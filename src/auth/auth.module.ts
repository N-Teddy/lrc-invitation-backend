import { Module } from '@nestjs/common';
import { APP_GUARD, Reflector } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module';
import { AuthGuard } from './guards/auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { GoogleService } from '../common/third-party/google.service';
import { AppConfigService } from '../config/app-config.service';

@Module({
    imports: [
        UsersModule,
        NotificationsModule,
        JwtModule.register({
            global: true,
        }),
    ],
    providers: [
        {
            provide: APP_GUARD,
            useClass: AuthGuard,
        },
        {
            provide: APP_GUARD,
            useClass: RolesGuard,
        },
        Reflector,
        AuthService,
        GoogleService,
        AppConfigService,
    ],
    controllers: [AuthController],
})
export class AuthModule {}
