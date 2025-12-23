import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { IS_PUBLIC_KEY } from '../../common/decorators/public.decorator';
import { UsersService } from '../../users/users.service';
import { AppConfigService } from '../../config/app-config.service';
import { UserRole } from '../../common/enums/user.enum';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        private readonly jwtService: JwtService,
        private readonly usersService: UsersService,
        private readonly config: AppConfigService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (isPublic) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers['authorization'] as string | undefined;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new UnauthorizedException('Missing bearer token');
        }
        const token = authHeader.substring(7);

        try {
            const payload = await this.jwtService.verifyAsync(token, {
                secret: this.config.jwtAccessSecret,
            });
            const user = await this.usersService.findById(payload.sub as string);
            if (!user) {
                throw new UnauthorizedException('User not found');
            }
            if (user.role === UserRole.Child) {
                throw new UnauthorizedException('Children cannot access the API');
            }
            request.user = user;
            return true;
        } catch {
            throw new UnauthorizedException('Invalid or expired token');
        }
    }
}
