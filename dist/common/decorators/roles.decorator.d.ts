import { MonitorLevel, UserRole } from '../enums/user.enum';
export declare const ROLES_KEY = "roles";
export interface RolesMetadata {
    roles?: UserRole[];
    monitorLevels?: MonitorLevel[];
}
export declare const Roles: (roles?: UserRole[], monitorLevels?: MonitorLevel[]) => import("@nestjs/common").CustomDecorator<string>;
