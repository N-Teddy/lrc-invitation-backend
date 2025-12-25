import { ActivityType, TargetingCode, Town } from '../../common/enums/activity.enum';
export declare class ActivityResponseDto {
    id: string;
    type: ActivityType;
    town: Town;
    startDate: Date;
    endDate: Date;
    conferenceDurationDays?: number;
    targetingCode: TargetingCode;
    invitedChildrenUserIds?: string[];
    invitedMonitorUserIds?: string[];
    createdByUserId?: string;
    notes?: string;
    createdAt?: Date;
    updatedAt?: Date;
}
