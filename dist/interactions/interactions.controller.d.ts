import { NotificationContextType } from '../common/enums/notification.enum';
import { InteractionListQueryDto } from '../dtos/request/interaction.dto';
import { InteractionsService } from './interactions.service';
export declare class InteractionsController {
    private readonly interactionsService;
    constructor(interactionsService: InteractionsService);
    listMine(currentUser: any, query: InteractionListQueryDto): Promise<{
        items: {
            id: string;
            userId: string;
            userName: string;
            notificationId: string;
            contextType: NotificationContextType;
            contextId: string;
            actionId: string;
            meta: import("mongoose").FlattenMaps<Record<string, any>>;
            createdAt: Date;
        }[];
        nextCursor: string;
    }>;
    listByContext(contextType: NotificationContextType, contextId: string, currentUser: any, query: InteractionListQueryDto): Promise<{
        items: {
            id: string;
            userId: string;
            userName: string;
            notificationId: string;
            contextType: NotificationContextType;
            contextId: string;
            actionId: string;
            meta: import("mongoose").FlattenMaps<Record<string, any>>;
            createdAt: Date;
        }[];
        nextCursor: string;
    }>;
}
