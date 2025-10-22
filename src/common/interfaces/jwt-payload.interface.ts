import { Role } from '../enums/role.enum';
import { Region } from '../enums/region.enum';

export interface JwtPayload {
    sub: number; // Monitor ID
    email: string;
    role: Role;
    assignedTown: Region;
}
