import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
    CreateActivityDto,
    UpdateActivityDto,
    UpdateActivityInvitationsDto,
} from '../dtos/request/activity.dto';
import { ActivityType, ChildGroup, TargetingCode, Town } from '../common/enums/activity.enum';
import { LifecycleStatus, MonitorLevel, UserRole } from '../common/enums/user.enum';
import { Activity, ActivityDocument } from '../schema/activity.schema';
import { Settings, SettingsDocument } from '../schema/settings.schema';
import { User, UserDocument } from '../schema/user.schema';
import { ChildProfile, ChildProfileDocument } from '../schema/child-profile.schema';
import { DEFAULT_AGE_TO_GROUP_MAPPING, AgeBand } from '../common/constants/groups.constants';
import { computeAgeYears } from '../common/utils/groups.util';
import { computeGroupFromAge } from '../common/utils/age-group.util';
import {
    isValidConferenceDuration,
    targetGroupsForTargetingCode,
} from '../common/utils/activity-targeting.util';

@Injectable()
export class ActivitiesService {
    constructor(
        @InjectModel(Activity.name) private readonly activityModel: Model<ActivityDocument>,
        @InjectModel(Settings.name) private readonly settingsModel: Model<SettingsDocument>,
        @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
        @InjectModel(ChildProfile.name)
        private readonly childProfileModel: Model<ChildProfileDocument>,
    ) {}

    async create(dto: CreateActivityDto, currentUser: Record<string, any>) {
        this.assertCanCreate(dto, currentUser);
        const activityPayload = this.normalizeCreatePayload(dto, currentUser);

        const created = await new this.activityModel(activityPayload).save();
        return created.toObject();
    }

    async findAll(filters: { town?: Town; type?: ActivityType; from?: string; to?: string }) {
        const query: Record<string, any> = {};
        if (filters.town) query.town = filters.town;
        if (filters.type) query.type = filters.type;
        if (filters.from || filters.to) {
            query.startDate = {};
            if (filters.from) query.startDate.$gte = new Date(filters.from);
            if (filters.to) query.startDate.$lte = new Date(filters.to);
        }
        return this.activityModel.find(query).sort({ startDate: -1 }).lean().exec();
    }

    async findOneOrFail(id: string) {
        const activity = await this.activityModel.findById(id).lean().exec();
        if (!activity) throw new NotFoundException('Activity not found');
        return activity;
    }

    async update(id: string, dto: UpdateActivityDto, currentUser: Record<string, any>) {
        const existing = await this.findOneOrFail(id);
        this.assertCanEdit(existing, currentUser);

        const payload = this.normalizeUpdatePayload(existing, dto, currentUser);
        const updated = await this.activityModel
            .findByIdAndUpdate(id, { $set: payload }, { new: true })
            .lean()
            .exec();
        if (!updated) throw new NotFoundException('Activity not found');
        return updated;
    }

    async remove(id: string, currentUser: Record<string, any>) {
        const existing = await this.findOneOrFail(id);
        this.assertCanEdit(existing, currentUser);
        await this.activityModel.findByIdAndDelete(id).exec();
        return { deleted: true };
    }

    async regenerateInvitations(id: string, currentUser: Record<string, any>) {
        const activity = await this.findOneOrFail(id);
        this.assertCanRegenerateInvitations(activity, currentUser);

        const { invitedChildrenUserIds, invitedMonitorUserIds } =
            await this.computeInvitations(activity);

        const updated = await this.activityModel
            .findByIdAndUpdate(
                id,
                { $set: { invitedChildrenUserIds, invitedMonitorUserIds } },
                { new: true },
            )
            .lean()
            .exec();
        if (!updated) throw new NotFoundException('Activity not found');
        return updated;
    }

    async overrideInvitations(
        id: string,
        dto: UpdateActivityInvitationsDto,
        currentUser: Record<string, any>,
    ) {
        const activity = await this.findOneOrFail(id);
        this.assertCanOverrideInvitations(activity, currentUser);

        const update: Record<string, any> = {};
        if (dto.invitedChildrenUserIds) {
            update.invitedChildrenUserIds = dto.invitedChildrenUserIds.map(
                (x) => new Types.ObjectId(x),
            );
        }
        if (dto.invitedMonitorUserIds) {
            update.invitedMonitorUserIds = dto.invitedMonitorUserIds.map(
                (x) => new Types.ObjectId(x),
            );
        }

        const updated = await this.activityModel
            .findByIdAndUpdate(id, { $set: update }, { new: true })
            .lean()
            .exec();
        if (!updated) throw new NotFoundException('Activity not found');
        return updated;
    }

    private normalizeCreatePayload(dto: CreateActivityDto, currentUser: Record<string, any>) {
        const startDate = new Date(dto.startDate);
        const endDate = new Date(dto.endDate);
        if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
            throw new BadRequestException('Invalid startDate/endDate');
        }
        if (startDate.getTime() > endDate.getTime()) {
            throw new BadRequestException('startDate must be before endDate');
        }

        const type = dto.type;
        const town = type === ActivityType.Conference ? Town.Yaounde : dto.town;

        if (type === ActivityType.Conference) {
            if (!isValidConferenceDuration(dto.conferenceDurationDays)) {
                throw new BadRequestException('Conference duration must be 2 or 5 days');
            }
        } else if (dto.conferenceDurationDays !== undefined) {
            throw new BadRequestException('conferenceDurationDays is only allowed for conferences');
        }

        return {
            type,
            town,
            startDate,
            endDate,
            conferenceDurationDays: dto.conferenceDurationDays,
            targetingCode: dto.targetingCode,
            notes: dto.notes,
            createdByUserId: currentUser?._id ?? currentUser?.id,
        };
    }

    private normalizeUpdatePayload(
        existing: Record<string, any>,
        dto: UpdateActivityDto,
        currentUser: Record<string, any>,
    ) {
        const merged: any = {
            ...existing,
            ...dto,
        };

        // Conferences always remain in Yaoundé.
        if (merged.type === ActivityType.Conference) {
            merged.town = Town.Yaounde;
            if (!isValidConferenceDuration(merged.conferenceDurationDays)) {
                throw new BadRequestException('Conference duration must be 2 or 5 days');
            }
        } else if (merged.conferenceDurationDays !== undefined) {
            throw new BadRequestException('conferenceDurationDays is only allowed for conferences');
        }

        if (dto.startDate) merged.startDate = new Date(dto.startDate);
        if (dto.endDate) merged.endDate = new Date(dto.endDate);
        if (
            merged.startDate &&
            merged.endDate &&
            merged.startDate.getTime() > merged.endDate.getTime()
        ) {
            throw new BadRequestException('startDate must be before endDate');
        }

        // Town edits: only relevant for non-conference activities.
        if (existing.type !== ActivityType.Conference && dto.town) {
            // Enforce town-scope for non-super monitors.
            if (currentUser?.monitorLevel !== MonitorLevel.Super) {
                const userTown = currentUser?.originTown;
                if (!userTown || dto.town !== userTown) {
                    throw new ForbiddenException('Cannot change town outside your scope');
                }
            }
        }

        const payload: any = {};
        if (dto.type !== undefined) payload.type = merged.type;
        if (dto.town !== undefined) payload.town = merged.town;
        if (dto.startDate !== undefined) payload.startDate = merged.startDate;
        if (dto.endDate !== undefined) payload.endDate = merged.endDate;
        if (dto.conferenceDurationDays !== undefined)
            payload.conferenceDurationDays = merged.conferenceDurationDays;
        if (dto.targetingCode !== undefined) payload.targetingCode = merged.targetingCode;
        if (dto.notes !== undefined) payload.notes = merged.notes;
        return payload;
    }

    private assertCanCreate(dto: CreateActivityDto, currentUser: Record<string, any>) {
        if (currentUser?.role !== UserRole.Monitor) {
            throw new ForbiddenException('Only monitors can create activities');
        }
        if (currentUser?.monitorLevel === MonitorLevel.Aspiring) {
            throw new ForbiddenException('Aspiring monitors cannot create activities');
        }
        if (
            dto.type === ActivityType.Conference &&
            currentUser?.monitorLevel !== MonitorLevel.Super
        ) {
            throw new ForbiddenException('Only Super Monitors can create conferences');
        }
        if (currentUser?.monitorLevel !== MonitorLevel.Super) {
            const userTown = currentUser?.originTown;
            if (!userTown) throw new ForbiddenException('Monitor town not set');
            if (dto.type !== ActivityType.Conference && dto.town !== userTown) {
                throw new ForbiddenException('Monitors can only create activities for their town');
            }
        }
    }

    private assertCanEdit(activity: Record<string, any>, currentUser: Record<string, any>) {
        if (currentUser?.role !== UserRole.Monitor) {
            throw new ForbiddenException('Only monitors can manage activities');
        }
        if (currentUser?.monitorLevel === MonitorLevel.Aspiring) {
            throw new ForbiddenException('Aspiring monitors cannot manage activities');
        }
        if (
            activity.type === ActivityType.Conference &&
            currentUser?.monitorLevel !== MonitorLevel.Super
        ) {
            throw new ForbiddenException('Only Super Monitors can manage conferences');
        }
        if (currentUser?.monitorLevel !== MonitorLevel.Super) {
            const userTown = currentUser?.originTown;
            if (!userTown) throw new ForbiddenException('Monitor town not set');
            if (activity.town !== userTown) {
                throw new ForbiddenException('Monitors can only manage activities for their town');
            }
        }
    }

    private assertCanRegenerateInvitations(
        activity: Record<string, any>,
        currentUser: Record<string, any>,
    ) {
        // Super can always regenerate; monitors can for their town activities (not conferences).
        if (currentUser?.monitorLevel === MonitorLevel.Super) return;
        if (activity.type === ActivityType.Conference) {
            throw new ForbiddenException(
                'Only Super Monitors can regenerate conference invitations',
            );
        }
        this.assertCanEdit(activity, currentUser);
    }

    private assertCanOverrideInvitations(
        _activity: Record<string, any>,
        currentUser: Record<string, any>,
    ) {
        if (currentUser?.monitorLevel !== MonitorLevel.Super) {
            throw new ForbiddenException('Only Super Monitors can override invitations');
        }
    }

    private async getAgeToGroupMapping(): Promise<{ bands: AgeBand[] }> {
        const existing = await this.settingsModel
            .findOne({ key: 'ageToGroupMapping' })
            .lean()
            .exec();
        if (existing?.value?.bands?.length) {
            return { bands: existing.value.bands as AgeBand[] };
        }
        return { bands: DEFAULT_AGE_TO_GROUP_MAPPING };
    }

    private async computeInvitations(activity: Record<string, any>) {
        const mapping = await this.getAgeToGroupMapping();
        const groups = targetGroupsForTargetingCode(activity.targetingCode as TargetingCode);
        const asOf = activity.startDate ? new Date(activity.startDate) : new Date();

        const childFilter: Record<string, any> = { role: UserRole.Child };
        if (activity.type !== ActivityType.Conference) {
            childFilter.originTown = activity.town;
        }

        const children = await this.userModel.find(childFilter).lean().exec();
        if (!children.length) {
            return {
                invitedChildrenUserIds: [],
                invitedMonitorUserIds: await this.computeMonitorInvites(activity),
            };
        }

        const childIds = children.map((c) => c._id);
        const profiles = await this.childProfileModel
            .find({ userId: { $in: childIds } })
            .lean()
            .exec();
        const profileByUserId = new Map<string, Record<string, any>>();
        for (const p of profiles) {
            profileByUserId.set(String(p.userId), p);
        }

        const invitedChildrenUserIds: Types.ObjectId[] = [];
        for (const child of children) {
            const profile = profileByUserId.get(String(child._id));
            if (
                child.lifecycleStatus === LifecycleStatus.Archived &&
                !profile?.adultOverrideAllowed
            ) {
                continue;
            }

            const group: ChildGroup | undefined =
                (profile?.currentGroup as ChildGroup | undefined) ??
                (child.dateOfBirth
                    ? computeGroupFromAge(
                          computeAgeYears(new Date(child.dateOfBirth), asOf),
                          mapping.bands,
                      )
                    : undefined);

            if (!group || !groups.includes(group)) {
                continue;
            }
            invitedChildrenUserIds.push(child._id);
        }

        const invitedMonitorUserIds = await this.computeMonitorInvites(activity);
        return { invitedChildrenUserIds, invitedMonitorUserIds };
    }

    private async computeMonitorInvites(activity: Record<string, any>) {
        const filter: Record<string, any> = {
            role: UserRole.Monitor,
            lifecycleStatus: LifecycleStatus.Active,
        };
        if (activity.type !== ActivityType.Conference) {
            filter.originTown = activity.town;
        }
        const monitors = await this.userModel.find(filter).select({ _id: 1 }).lean().exec();
        return monitors.map((m) => m._id as Types.ObjectId);
    }
}
