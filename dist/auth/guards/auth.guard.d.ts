import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../../users/users.service';
import { AppConfigService } from '../../config/app-config.service';
export declare class AuthGuard implements CanActivate {
    private readonly reflector;
    private readonly jwtService;
    private readonly usersService;
    private readonly config;
    constructor(reflector: Reflector, jwtService: JwtService, usersService: UsersService, config: AppConfigService);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
