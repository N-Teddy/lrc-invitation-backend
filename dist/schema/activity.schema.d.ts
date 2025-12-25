import { HydratedDocument, Types } from 'mongoose';
import { ActivityType, TargetingCode, Town } from '../common/enums/activity.enum';
export type ActivityDocument = HydratedDocument<Activity>;
export declare class Activity {
    type: ActivityType;
    town: Town;
    startDate: Date;
    endDate: Date;
    conferenceDurationDays?: number;
    targetingCode: TargetingCode;
    invitedChildrenUserIds: Types.ObjectId[];
    invitedMonitorUserIds: Types.ObjectId[];
    createdByUserId?: Types.ObjectId;
    notes?: string;
}
export declare const ActivitySchema: import("mongoose").Schema<Activity, import("mongoose").Model<Activity, any, any, any, import("mongoose").Document<unknown, any, Activity> & Activity & {
    _id: Types.ObjectId;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Activity, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<Activity>> & import("mongoose").FlatRecord<Activity> & {
    _id: Types.ObjectId;
}>;
