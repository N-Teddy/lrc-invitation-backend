import { HydratedDocument, Types } from 'mongoose';
import { ChildGroup } from '../common/enums/activity.enum';
export type ChildProfileDocument = HydratedDocument<ChildProfile>;
declare class GuardianContact {
    fullName: string;
    phoneE164: string;
    relationship: string;
    email?: string;
}
export declare class ChildProfile {
    userId: Types.ObjectId;
    guardians: GuardianContact[];
    currentGroup?: ChildGroup;
    groupComputedAt?: Date;
    adultOverrideAllowed?: boolean;
    lastGroupChangeReminderAt?: Date;
}
export declare const ChildProfileSchema: import("mongoose").Schema<ChildProfile, import("mongoose").Model<ChildProfile, any, any, any, import("mongoose").Document<unknown, any, ChildProfile> & ChildProfile & {
    _id: Types.ObjectId;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, ChildProfile, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<ChildProfile>> & import("mongoose").FlatRecord<ChildProfile> & {
    _id: Types.ObjectId;
}>;
export {};
