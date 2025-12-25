import { HydratedDocument } from 'mongoose';
export type JobRunDocument = HydratedDocument<JobRun>;
export declare class JobRun {
    jobKey: string;
    runKey: string;
    meta?: Record<string, any>;
}
export declare const JobRunSchema: import("mongoose").Schema<JobRun, import("mongoose").Model<JobRun, any, any, any, import("mongoose").Document<unknown, any, JobRun> & JobRun & {
    _id: import("mongoose").Types.ObjectId;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, JobRun, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<JobRun>> & import("mongoose").FlatRecord<JobRun> & {
    _id: import("mongoose").Types.ObjectId;
}>;
