import { HydratedDocument, Types } from 'mongoose';
import { AttendanceRoleAtTime, ClassificationLabel } from '../common/enums/attendance.enum';
import { ChildGroup, Town } from '../common/enums/activity.enum';
export type AttendanceDocument = HydratedDocument<Attendance>;
declare class AttendanceEntry {
    userId: Types.ObjectId;
    present: boolean;
    roleAtTime: AttendanceRoleAtTime;
    originTownAtTime?: Town;
    groupAtTime?: ChildGroup;
    classificationLabel?: ClassificationLabel;
}
declare class ExternalAttendanceEntry {
    classificationLabel: ClassificationLabel;
    externalId: string;
    fullName: string;
    scopeTown?: Town;
}
export declare class Attendance {
    activityId: Types.ObjectId;
    takenByUserId?: Types.ObjectId;
    takenAt?: Date;
    entries: AttendanceEntry[];
    externalEntries: ExternalAttendanceEntry[];
}
export declare const AttendanceSchema: import("mongoose").Schema<Attendance, import("mongoose").Model<Attendance, any, any, any, import("mongoose").Document<unknown, any, Attendance> & Attendance & {
    _id: Types.ObjectId;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Attendance, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<Attendance>> & import("mongoose").FlatRecord<Attendance> & {
    _id: Types.ObjectId;
}>;
export {};
