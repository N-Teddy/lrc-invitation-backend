import { ActivityType, TargetingCode, Town } from '../../common/enums/activity.enum';
export declare class CreateActivityDto {
    type: ActivityType;
    town?: Town;
    startDate: string;
    endDate: string;
    conferenceDurationDays?: number;
    targetingCode: TargetingCode;
    notes?: string;
}
declare const UpdateActivityDto_base: import("@nestjs/common").Type<Partial<CreateActivityDto>>;
export declare class UpdateActivityDto extends UpdateActivityDto_base {
}
export declare class UpdateActivityInvitationsDto {
    invitedChildrenUserIds?: string[];
    invitedMonitorUserIds?: string[];
}
export {};
