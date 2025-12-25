import { ActivityType, Town } from '../common/enums/activity.enum';
import { CreateActivityDto, UpdateActivityDto, UpdateActivityInvitationsDto } from '../dtos/request/activity.dto';
import { ActivitiesService } from './activities.service';
export declare class ActivitiesController {
    private readonly activitiesService;
    constructor(activitiesService: ActivitiesService);
    create(dto: CreateActivityDto, currentUser: any): Promise<import("mongoose").Document<unknown, {}, import("../schema/activity.schema").Activity> & import("../schema/activity.schema").Activity & {
        _id: import("mongoose").Types.ObjectId;
    } & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>>;
    findAll(town?: Town, type?: ActivityType, from?: string, to?: string, currentUser?: any): Promise<(import("mongoose").FlattenMaps<import("mongoose").Document<unknown, {}, import("../schema/activity.schema").Activity> & import("../schema/activity.schema").Activity & {
        _id: import("mongoose").Types.ObjectId;
    }> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>)[]>;
    findOne(id: string, currentUser: any): Promise<import("mongoose").FlattenMaps<import("mongoose").Document<unknown, {}, import("../schema/activity.schema").Activity> & import("../schema/activity.schema").Activity & {
        _id: import("mongoose").Types.ObjectId;
    }> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>>;
    conferenceEligibility(id: string, currentUser: any): Promise<{
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
    update(id: string, dto: UpdateActivityDto, currentUser: any): Promise<import("mongoose").FlattenMaps<import("mongoose").Document<unknown, {}, import("../schema/activity.schema").Activity> & import("../schema/activity.schema").Activity & {
        _id: import("mongoose").Types.ObjectId;
    }> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>>;
    remove(id: string, currentUser: any): Promise<{
        deleted: boolean;
    }>;
    regenerateInvitations(id: string, currentUser: any): Promise<import("mongoose").FlattenMaps<import("mongoose").Document<unknown, {}, import("../schema/activity.schema").Activity> & import("../schema/activity.schema").Activity & {
        _id: import("mongoose").Types.ObjectId;
    }> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>>;
    overrideInvitations(id: string, dto: UpdateActivityInvitationsDto, currentUser: any): Promise<import("mongoose").FlattenMaps<import("mongoose").Document<unknown, {}, import("../schema/activity.schema").Activity> & import("../schema/activity.schema").Activity & {
        _id: import("mongoose").Types.ObjectId;
    }> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>>;
    invitedChildren(id: string, currentUser: any): Promise<{
        activityId: string;
        targetGroups: import("../common/enums/activity.enum").ChildGroup[];
        invited: {
            userId: string;
            fullName: string;
            group: import("../common/enums/activity.enum").ChildGroup;
            profileImageUrl: string | undefined;
        }[];
    }>;
    eligibleChildren(id: string, query: string, limit: string, currentUser: any): Promise<{
        activityId: string;
        query: string;
        targetGroups: import("../common/enums/activity.enum").ChildGroup[];
        results: {
            userId: string;
            fullName: string;
            group?: import("../common/enums/activity.enum").ChildGroup;
            profileImageUrl?: string;
        }[];
    }>;
}
