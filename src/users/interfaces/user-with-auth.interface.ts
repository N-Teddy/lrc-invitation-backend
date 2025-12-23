import { MonitorLevel, UserRole } from '../../common/enums/user.enum';

export interface UserWithAuth {
    _id: string;
    role: UserRole;
    monitorLevel?: MonitorLevel;
}
