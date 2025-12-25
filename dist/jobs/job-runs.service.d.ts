import { Model } from 'mongoose';
import { JobRunDocument } from '../schema/job-run.schema';
export declare class JobRunsService {
    private readonly jobRunModel;
    constructor(jobRunModel: Model<JobRunDocument>);
    tryStart(jobKey: string, runKey: string, meta?: Record<string, any>): Promise<boolean>;
}
