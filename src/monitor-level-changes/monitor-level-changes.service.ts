import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserRole } from '../common/enums/user.enum';
import {
    MonitorLevelChange,
    MonitorLevelChangeDocument,
} from '../schema/monitor-level-change.schema';

@Injectable()
export class MonitorLevelChangesService {
    constructor(
        @InjectModel(MonitorLevelChange.name)
        private readonly monitorLevelChangeModel: Model<MonitorLevelChangeDocument>,
    ) {}

    async listRecent(currentUser: Record<string, any>, opts?: { limit?: number; days?: number }) {
        if (currentUser?.role !== UserRole.Monitor) {
            throw new ForbiddenException('Only monitors can access level changes');
        }

        const limit = Math.min(Math.max(opts?.limit ?? 6, 1), 20);
        const days = Math.min(Math.max(opts?.days ?? 7, 1), 30);
        const since = new Date();
        since.setDate(since.getDate() - days);

        const items = await this.monitorLevelChangeModel
            .find({ createdAt: { $gte: since } })
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean()
            .exec();
        return items.map((item) => ({
            id: String(item._id),
            userId: String(item.userId),
            oldLevel: item.oldLevel,
            newLevel: item.newLevel,
            changedByUserId: item.changedByUserId ? String(item.changedByUserId) : undefined,
            createdAt: item.createdAt,
        }));
    }
}
