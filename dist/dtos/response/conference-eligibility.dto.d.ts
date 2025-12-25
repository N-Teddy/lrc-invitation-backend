export declare class FlaggedConferenceChildDto {
    userId: string;
    reason: string;
}
export declare class ConferenceEligibilityResponseDto {
    activityId: string;
    windowStart: Date;
    windowEnd: Date;
    invitedCount: number;
    qualifiedCount: number;
    flaggedCount: number;
    flaggedChildren: FlaggedConferenceChildDto[];
}
