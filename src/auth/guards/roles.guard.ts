import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY, RolesMetadata } from '../../common/decorators/roles.decorator';
import { MonitorLevel, UserRole } from '../../common/enums/user.enum';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const meta = this.reflector.getAllAndOverride<RolesMetadata>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (!meta || (!meta.roles?.length && !meta.monitorLevels?.length)) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const user = request.user as { role?: UserRole; monitorLevel?: MonitorLevel } | undefined;
        if (!user) {
            throw new ForbiddenException('Access denied');
        }

        if (meta.roles?.length && !meta.roles.includes(user.role as UserRole)) {
            throw new ForbiddenException('Role not permitted');
        }
        if (
            meta.monitorLevels?.length &&
            user.role === UserRole.Monitor &&
            !meta.monitorLevels.includes(user.monitorLevel as MonitorLevel)
        ) {
            throw new ForbiddenException('Monitor level not permitted');
        }

        return true;
    }
}
