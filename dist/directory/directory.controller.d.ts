import { MonitorDirectoryQueryDto } from '../dtos/request/directory.dto';
import { DirectoryService } from './directory.service';
export declare class DirectoryController {
    private readonly directoryService;
    constructor(directoryService: DirectoryService);
    monitors(currentUser: any, query: MonitorDirectoryQueryDto): Promise<{
        userId: string;
        fullName: string;
        originTown: import("../common/enums/activity.enum").Town;
        monitorLevel: import("../common/enums/user.enum").MonitorLevel;
        profileImageUrl: string;
    }[]>;
}
