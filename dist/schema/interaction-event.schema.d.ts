import { HydratedDocument, Types } from 'mongoose';
import { NotificationContextType } from '../common/enums/notification.enum';
export type InteractionEventDocument = HydratedDocument<InteractionEvent>;
export declare class InteractionEvent {
    userId: Types.ObjectId;
    notificationId?: Types.ObjectId;
    contextType: NotificationContextType;
    contextId: string;
    actionId: string;
    meta?: Record<string, any>;
    createdAt?: Date;
    updatedAt?: Date;
}
export declare const InteractionEventSchema: import("mongoose").Schema<InteractionEvent, import("mongoose").Model<InteractionEvent, any, any, any, import("mongoose").Document<unknown, any, InteractionEvent> & InteractionEvent & {
    _id: Types.ObjectId;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, InteractionEvent, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<InteractionEvent>> & import("mongoose").FlatRecord<InteractionEvent> & {
    _id: Types.ObjectId;
}>;
