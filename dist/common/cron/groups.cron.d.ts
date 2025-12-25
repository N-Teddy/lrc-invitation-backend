import { OnModuleInit } from '@nestjs/common';
import { GroupsService } from '../../groups/groups.service';
export declare class GroupsCron implements OnModuleInit {
    private readonly groupsService;
    private readonly logger;
    constructor(groupsService: GroupsService);
    onModuleInit(): void;
}
