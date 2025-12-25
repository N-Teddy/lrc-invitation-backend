import { HydratedDocument, Types } from 'mongoose';
import { MonitorLevel } from '../common/enums/user.enum';
import { Town } from '../common/enums/activity.enum';
export type MonitorProfileDocument = HydratedDocument<MonitorProfile>;
export declare class MonitorProfile {
    userId: Types.ObjectId;
    level?: MonitorLevel;
    probationStartDate?: Date;
    probationEndDate?: Date;
    homeTown?: Town;
    preferredLanguage?: string;
}
export declare const MonitorProfileSchema: import("mongoose").Schema<MonitorProfile, import("mongoose").Model<MonitorProfile, any, any, any, import("mongoose").Document<unknown, any, MonitorProfile> & MonitorProfile & {
    _id: Types.ObjectId;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, MonitorProfile, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<MonitorProfile>> & import("mongoose").FlatRecord<MonitorProfile> & {
    _id: Types.ObjectId;
}>;
