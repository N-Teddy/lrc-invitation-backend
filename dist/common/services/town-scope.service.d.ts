import { Model } from 'mongoose';
import { Town } from '../enums/activity.enum';
import { MonitorProfileDocument } from '../../schema/monitor-profile.schema';
export declare class TownScopeService {
    private readonly monitorProfileModel;
    constructor(monitorProfileModel: Model<MonitorProfileDocument>);
    resolveMonitorTown(currentUser: Record<string, any>): Promise<Town | undefined>;
}
