import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Town } from '../enums/activity.enum';
import { MonitorProfile, MonitorProfileDocument } from '../../schema/monitor-profile.schema';

@Injectable()
export class TownScopeService {
    constructor(
        @InjectModel(MonitorProfile.name)
        private readonly monitorProfileModel: Model<MonitorProfileDocument>,
    ) {}

    async resolveMonitorTown(currentUser: Record<string, any>): Promise<Town | undefined> {
        const userId = currentUser?._id ?? currentUser?.id;
        if (!userId) return undefined;

        const profile = await this.monitorProfileModel
            .findOne({ userId: new Types.ObjectId(String(userId)) })
            .lean()
            .exec();
        return (
            (profile?.homeTown as Town | undefined) ?? (currentUser?.originTown as Town | undefined)
        );
    }
}
