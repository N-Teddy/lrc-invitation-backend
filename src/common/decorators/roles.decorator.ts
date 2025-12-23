import { SetMetadata } from '@nestjs/common';
import { MonitorLevel, UserRole } from '../enums/user.enum';

export const ROLES_KEY = 'roles';
export interface RolesMetadata {
    roles?: UserRole[];
    monitorLevels?: MonitorLevel[];
}

export const Roles = (roles: UserRole[] = [], monitorLevels: MonitorLevel[] = []) =>
    SetMetadata(ROLES_KEY, { roles, monitorLevels } as RolesMetadata);
