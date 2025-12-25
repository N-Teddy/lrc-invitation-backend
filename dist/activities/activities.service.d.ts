import { Model, Types } from 'mongoose';
import { CreateActivityDto, UpdateActivityDto, UpdateActivityInvitationsDto } from '../dtos/request/activity.dto';
import { ActivityType, ChildGroup, Town } from '../common/enums/activity.enum';
import { Activity, ActivityDocument } from '../schema/activity.schema';
import { UserDocument } from '../schema/user.schema';
import { ChildProfileDocument } from '../schema/child-profile.schema';
import { AttendanceDocument } from '../schema/attendance.schema';
import { TownScopeService } from '../common/services/town-scope.service';
import { SettingsService } from '../settings/settings.service';
export declare class ActivitiesService {
    private readonly activityModel;
    private readonly userModel;
    private readonly childProfileModel;
    private readonly attendanceModel;
    private readonly townScopeService;
    private readonly settingsService;
    constructor(activityModel: Model<ActivityDocument>, userModel: Model<UserDocument>, childProfileModel: Model<ChildProfileDocument>, attendanceModel: Model<AttendanceDocument>, townScopeService: TownScopeService, settingsService: SettingsService);
    create(dto: CreateActivityDto, currentUser: Record<string, any>): Promise<import("mongoose").Document<unknown, {}, Activity> & Activity & {
        _id: Types.ObjectId;
    } & Required<{
        _id: Types.ObjectId;
    }>>;
    findAll(filters: {
        town?: Town;
        type?: ActivityType;
        from?: string;
        to?: string;
    }, currentUser?: Record<string, any>): Promise<(import("mongoose").FlattenMaps<import("mongoose").Document<unknown, {}, Activity> & Activity & {
        _id: Types.ObjectId;
    }> & Required<{
        _id: Types.ObjectId;
    }>)[]>;
    findOneOrFail(id: string, currentUser?: Record<string, any>): Promise<import("mongoose").FlattenMaps<import("mongoose").Document<unknown, {}, Activity> & Activity & {
        _id: Types.ObjectId;
    }> & Required<{
        _id: Types.ObjectId;
    }>>;
    update(id: string, dto: UpdateActivityDto, currentUser: Record<string, any>): Promise<import("mongoose").FlattenMaps<import("mongoose").Document<unknown, {}, Activity> & Activity & {
        _id: Types.ObjectId;
    }> & Required<{
        _id: Types.ObjectId;
    }>>;
    remove(id: string, currentUser: Record<string, any>): Promise<{
        deleted: boolean;
    }>;
    regenerateInvitations(id: string, currentUser: Record<string, any>): Promise<import("mongoose").FlattenMaps<import("mongoose").Document<unknown, {}, Activity> & Activity & {
        _id: Types.ObjectId;
    }> & Required<{
        _id: Types.ObjectId;
    }>>;
    overrideInvitations(id: string, dto: UpdateActivityInvitationsDto, currentUser: Record<string, any>): Promise<import("mongoose").FlattenMaps<import("mongoose").Document<unknown, {}, Activity> & Activity & {
        _id: Types.ObjectId;
    }> & Required<{
        _id: Types.ObjectId;
    }>>;
    getInvitedChildrenDetails(activityId: string, currentUser: Record<string, any>): Promise<{
        activityId: string;
        targetGroups: ChildGroup[];
        invited: {
            userId: string;
            fullName: string;
            group: ChildGroup;
            profileImageUrl: string | undefined;
        }[];
    }>;
    searchEligibleChildrenForInvitations(activityId: string, query: string, limit: number, currentUser: Record<string, any>): Promise<{
        activityId: string;
        query: string;
        targetGroups: ChildGroup[];
        results: {
            userId: string;
            fullName: string;
            group?: ChildGroup;
            profileImageUrl?: string;
        }[];
    }>;
    getConferenceEligibility(activityId: string, currentUser: Record<string, any>): Promise<{
        activityId: string;
        windowStart: Date;
        windowEnd: Date;
        invitedCount: number;
        qualifiedCount: number;
        flaggedCount: number;
        flaggedChildren: {
            userId: string;
            reason: string;
        }[];
    }>;
    private normalizeCreatePayload;
    private normalizeUpdatePayload;
    private assertCanCreate;
    private assertCanEdit;
    private assertCanRead;
    private assertCanRegenerateInvitations;
    private assertCanOverrideInvitations;
    private getAgeToGroupMapping;
    private computeInvitations;
    private validateInvitationOverride;
    private computeMonitorInvites;
}
