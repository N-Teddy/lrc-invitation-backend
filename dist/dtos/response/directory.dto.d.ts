import { MonitorLevel } from '../../common/enums/user.enum';
import { Town } from '../../common/enums/activity.enum';
export declare class MonitorDirectoryResponseDto {
    userId: string;
    fullName: string;
    originTown?: Town;
    monitorLevel?: MonitorLevel;
    profileImageUrl?: string;
}
