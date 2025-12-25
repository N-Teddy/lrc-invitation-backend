import { HydratedDocument, Types } from 'mongoose';
import { Channel, ReminderKind, ReminderStatus } from '../common/enums/notification.enum';
export type ReminderDocument = HydratedDocument<Reminder>;
export declare enum ReminderScheduleType {
    Once = "once",
    IntervalMinutes = "interval_minutes",
    Daily = "daily",
    Weekly = "weekly",
    Monthly = "monthly"
}
declare class ExpectedResponse {
    label?: string;
    value?: string;
}
declare class ReminderSchedule {
    type?: ReminderScheduleType;
    runAt?: Date;
    intervalMinutes?: number;
    hour?: number;
    minute?: number;
    dayOfWeek?: number;
    dayOfMonth?: number;
}
export declare class Reminder {
    kind: ReminderKind;
    createdByUserId?: Types.ObjectId;
    message: string;
    channel: Channel;
    schedule?: ReminderSchedule;
    nextRunAt?: Date;
    lastSentAt?: Date;
    awaitingAckUserIds: string[];
    acknowledgedByUserIds: string[];
    recipients: string[];
    expectedResponses: ExpectedResponse[];
    status: ReminderStatus;
    context?: Record<string, any>;
}
export declare const ReminderSchema: import("mongoose").Schema<Reminder, import("mongoose").Model<Reminder, any, any, any, import("mongoose").Document<unknown, any, Reminder> & Reminder & {
    _id: Types.ObjectId;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Reminder, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<Reminder>> & import("mongoose").FlatRecord<Reminder> & {
    _id: Types.ObjectId;
}>;
export {};
