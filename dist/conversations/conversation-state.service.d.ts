import { Model, Types } from 'mongoose';
import { ConversationState, ConversationStateDocument } from '../schema/conversation-state.schema';
import { NotificationContextType } from '../common/enums/notification.enum';
export declare class ConversationStateService {
    private readonly conversationStateModel;
    constructor(conversationStateModel: Model<ConversationStateDocument>);
    upsert(params: {
        userId: string;
        contextType: NotificationContextType;
        contextId: string;
        state: string;
        allowedResponses: string[];
        expiresAt: Date;
        lastNotificationId?: string;
    }): Promise<import("mongoose").FlattenMaps<import("mongoose").Document<unknown, {}, ConversationState> & ConversationState & {
        _id: Types.ObjectId;
    }> & Required<{
        _id: Types.ObjectId;
    }>>;
    get(userId: string, contextType: NotificationContextType, contextId: string): Promise<import("mongoose").FlattenMaps<import("mongoose").Document<unknown, {}, ConversationState> & ConversationState & {
        _id: Types.ObjectId;
    }> & Required<{
        _id: Types.ObjectId;
    }>>;
    complete(userId: string, contextType: NotificationContextType, contextId: string): Promise<import("mongoose").FlattenMaps<import("mongoose").Document<unknown, {}, ConversationState> & ConversationState & {
        _id: Types.ObjectId;
    }> & Required<{
        _id: Types.ObjectId;
    }>>;
}
