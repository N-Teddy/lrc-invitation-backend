import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type JobRunDocument = HydratedDocument<JobRun>;

@Schema({ timestamps: true })
export class JobRun {
    @Prop({ required: true })
    jobKey: string;

    @Prop({ required: true })
    runKey: string;

    @Prop({ type: Object })
    meta?: Record<string, any>;
}

export const JobRunSchema = SchemaFactory.createForClass(JobRun);
JobRunSchema.index({ jobKey: 1, runKey: 1 }, { unique: true });
// Keep job run markers long enough to prevent duplicates across restarts (2 years).
JobRunSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 365 * 2 });
