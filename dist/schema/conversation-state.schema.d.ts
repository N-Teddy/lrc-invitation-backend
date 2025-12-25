import { HydratedDocument, Types } from 'mongoose';
import { NotificationContextType } from '../common/enums/notification.enum';
export type ConversationStateDocument = HydratedDocument<ConversationState>;
export declare class ConversationState {
    userId: Types.ObjectId;
    contextType: NotificationContextType;
    contextId: string;
    state: string;
    allowedResponses: string[];
    expiresAt: Date;
    lastNotificationId?: Types.ObjectId;
}
export declare const ConversationStateSchema: import("mongoose").Schema<ConversationState, import("mongoose").Model<ConversationState, any, any, any, import("mongoose").Document<unknown, any, ConversationState> & ConversationState & {
    _id: Types.ObjectId;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, ConversationState, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<ConversationState>> & import("mongoose").FlatRecord<ConversationState> & {
    _id: Types.ObjectId;
}>;
