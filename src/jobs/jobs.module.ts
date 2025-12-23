import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JobRun, JobRunSchema } from '../schema/job-run.schema';
import { JobRunsService } from './job-runs.service';

@Module({
    imports: [MongooseModule.forFeature([{ name: JobRun.name, schema: JobRunSchema }])],
    providers: [JobRunsService],
    exports: [JobRunsService],
})
export class JobsModule {}
