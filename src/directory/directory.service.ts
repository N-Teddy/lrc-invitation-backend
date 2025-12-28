import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { TownScopeService } from '../common/services/town-scope.service';
import { LifecycleStatus, UserRole } from '../common/enums/user.enum';
import { MonitorDirectoryQueryDto } from '../dtos/request/directory.dto';
import { User, UserDocument } from '../schema/user.schema';

@Injectable()
export class DirectoryService {
    constructor(
        @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
        private readonly townScopeService: TownScopeService,
    ) {}

    async listMonitors(currentUser: Record<string, any>, query: MonitorDirectoryQueryDto) {
        const town = await this.townScopeService.resolveMonitorTown(currentUser);
        if (!town) throw new ForbiddenException('Monitor town not set');

        const limit = Math.min(Math.max(query.limit ?? 20, 1), 50);
        const q = (query.q ?? '').trim();
        const ids = (query.ids ?? []).map((x) => String(x)).filter(Boolean);

        const mongoQuery: Record<string, any> = {
            role: UserRole.Monitor,
            originTown: town,
            lifecycleStatus: LifecycleStatus.Active,
        };

        if (ids.length) {
            mongoQuery._id = { $in: ids.map((id) => new Types.ObjectId(id)) };
        } else if (q.length >= 2) {
            mongoQuery.fullName = {
                $regex: q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
                $options: 'i',
            };
        }

        const users = await this.userModel
            .find(mongoQuery)
            .select({
                _id: 1,
                fullName: 1,
                originTown: 1,
                monitorLevel: 1,
                profileImage: 1,
                dateOfBirth: 1,
            })
            .sort({ fullName: 1 })
            .limit(limit)
            .lean()
            .exec();

        return users.map((u) => ({
            userId: String(u._id),
            fullName: u.fullName,
            originTown: u.originTown,
            monitorLevel: u.monitorLevel,
            profileImageUrl: u.profileImage?.url,
            dateOfBirth: u.dateOfBirth,
        }));
    }
}
