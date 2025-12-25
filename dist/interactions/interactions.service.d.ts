import { Model } from 'mongoose';
import { NotificationContextType } from '../common/enums/notification.enum';
import { ActivityDocument } from '../schema/activity.schema';
import { InteractionEventDocument } from '../schema/interaction-event.schema';
import { ReminderDocument } from '../schema/reminder.schema';
import { UserDocument } from '../schema/user.schema';
export declare class InteractionsService {
    private readonly interactionEventModel;
    private readonly userModel;
    private readonly reminderModel;
    private readonly activityModel;
    constructor(interactionEventModel: Model<InteractionEventDocument>, userModel: Model<UserDocument>, reminderModel: Model<ReminderDocument>, activityModel: Model<ActivityDocument>);
    listMine(currentUser: Record<string, any>, limit?: number, cursor?: string): Promise<{
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
    listByContext(contextType: NotificationContextType, contextId: string, currentUser: Record<string, any>, limit?: number, cursor?: string): Promise<{
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
    private assertCanReadContext;
}
