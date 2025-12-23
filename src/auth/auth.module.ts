import { Module } from '@nestjs/common';
import { APP_GUARD, Reflector } from '@nestjs/core';
import { UsersModule } from '../users/users.module';
import { AuthGuard } from './guards/auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { AuthController } from './auth.controller';

@Module({
    imports: [UsersModule],
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
    ],
    controllers: [AuthController],
})
export class AuthModule {}
