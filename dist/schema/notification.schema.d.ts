import { HydratedDocument, Types } from 'mongoose';
import { Channel, NotificationContextType, NotificationStatus } from '../common/enums/notification.enum';
export type NotificationDocument = HydratedDocument<Notification>;
declare class InteractiveOption {
    id?: string;
    label?: string;
}
export declare class Notification {
    primaryChannel: Channel;
    channelUsed: Channel;
    fallbackUsed?: boolean;
    skipReason?: string;
    toUserId: Types.ObjectId;
    contextType: NotificationContextType;
    contextId: string;
    templateName?: string;
    templateLanguage?: string;
    languageUsed?: string;
    languageFallbackUsed?: boolean;
    interactiveOptions: InteractiveOption[];
    status: NotificationStatus;
    payload?: Record<string, any>;
    attempts: number;
    maxAttempts: number;
    nextAttemptAt?: Date;
    lastAttemptAt?: Date;
    providerMessageId?: string;
    error?: string;
    sentAt?: Date;
}
export declare const NotificationSchema: import("mongoose").Schema<Notification, import("mongoose").Model<Notification, any, any, any, import("mongoose").Document<unknown, any, Notification> & Notification & {
    _id: Types.ObjectId;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Notification, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<Notification>> & import("mongoose").FlatRecord<Notification> & {
    _id: Types.ObjectId;
}>;
export {};
