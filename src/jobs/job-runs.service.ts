import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JobRun, JobRunDocument } from '../schema/job-run.schema';

@Injectable()
export class JobRunsService {
    constructor(
        @InjectModel(JobRun.name)
        private readonly jobRunModel: Model<JobRunDocument>,
    ) {}

    async tryStart(jobKey: string, runKey: string, meta?: Record<string, any>) {
        try {
            await this.jobRunModel.create({ jobKey, runKey, meta });
            return true;
        } catch (err: any) {
            if (err?.code === 11000) {
                return false;
            }
            throw err;
        }
    }
}
