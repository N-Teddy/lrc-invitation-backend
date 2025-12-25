import { LifecycleStatus, MonitorLevel, UserRole } from '../../common/enums/user.enum';
import { Town } from '../../common/enums/activity.enum';
export declare class UserResponseDto {
    id: string;
    fullName: string;
    role: UserRole;
    monitorLevel?: MonitorLevel;
    dateOfBirth?: Date;
    originTown?: Town;
    preferredLanguage?: string;
    profileImage?: {
        url?: string;
        provider?: string;
        publicId?: string;
        mimeType?: string;
        sizeBytes?: number;
        updatedAt?: Date;
    };
    lifecycleStatus?: LifecycleStatus;
    archivedReason?: string;
}
