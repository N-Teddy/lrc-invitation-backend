import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
    MonitorLevelChange,
    MonitorLevelChangeSchema,
} from '../schema/monitor-level-change.schema';
import { MonitorLevelChangesController } from './monitor-level-changes.controller';
import { MonitorLevelChangesService } from './monitor-level-changes.service';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: MonitorLevelChange.name, schema: MonitorLevelChangeSchema },
        ]),
    ],
    controllers: [MonitorLevelChangesController],
    providers: [MonitorLevelChangesService],
})
export class MonitorLevelChangesModule {}
