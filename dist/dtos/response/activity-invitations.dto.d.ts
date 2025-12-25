import { ChildGroup } from '../../common/enums/activity.enum';
export declare class InvitedChildCardDto {
    userId: string;
    fullName: string;
    group?: ChildGroup;
    profileImageUrl?: string;
}
export declare class ActivityInvitedChildrenResponseDto {
    activityId: string;
    targetGroups?: ChildGroup[];
    invited: InvitedChildCardDto[];
}
export declare class ActivityEligibleChildrenResponseDto {
    activityId: string;
    query: string;
    targetGroups?: ChildGroup[];
    results: InvitedChildCardDto[];
}
