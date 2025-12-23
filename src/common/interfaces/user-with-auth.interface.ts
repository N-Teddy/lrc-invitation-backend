import { MonitorLevel, UserRole } from '../enums/user.enum';

export interface UserWithAuth {
    _id: string;
    role: UserRole;
    monitorLevel?: MonitorLevel;
}
