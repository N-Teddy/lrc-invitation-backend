export enum Role {
    DEV = 'dev',
    ADMIN = 'admin',
    CHIEF_MONITOR = 'chief_monitor',
    MONITOR = 'monitor',
}

export const RoleHierarchy = {
    [Role.DEV]: 4,
    [Role.ADMIN]: 3,
    [Role.CHIEF_MONITOR]: 2,
    [Role.MONITOR]: 1,
};
