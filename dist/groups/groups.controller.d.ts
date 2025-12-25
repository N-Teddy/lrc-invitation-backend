import { GroupsService } from './groups.service';
export declare class GroupsController {
    private readonly groupsService;
    constructor(groupsService: GroupsService);
    getMapping(): Promise<{
        bands: import("../common/constants/groups.constants").AgeBand[];
    }>;
    recompute(): Promise<{
        processedChildren: number;
        updatedGroups: number;
        archivedAdults: number;
        remindersCreated: number;
    }>;
}
