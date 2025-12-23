import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../../common/decorators/public.decorator';
import { UsersService } from '../../users/users.service';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        private readonly usersService: UsersService,
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
        const userId = request.headers['x-user-id'] as string | undefined;
        if (!userId) {
            throw new UnauthorizedException('Missing x-user-id header');
        }

        const user = await this.usersService.findById(userId);
        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        request.user = user;
        return true;
    }
}
