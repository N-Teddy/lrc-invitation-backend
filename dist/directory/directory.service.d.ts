import { Model } from 'mongoose';
import { TownScopeService } from '../common/services/town-scope.service';
import { MonitorDirectoryQueryDto } from '../dtos/request/directory.dto';
import { UserDocument } from '../schema/user.schema';
export declare class DirectoryService {
    private readonly userModel;
    private readonly townScopeService;
    constructor(userModel: Model<UserDocument>, townScopeService: TownScopeService);
    listMonitors(currentUser: Record<string, any>, query: MonitorDirectoryQueryDto): Promise<{
        userId: string;
        fullName: string;
        originTown: import("../common/enums/activity.enum").Town;
        monitorLevel: import("../common/enums/user.enum").MonitorLevel;
        profileImageUrl: string;
    }[]>;
}
