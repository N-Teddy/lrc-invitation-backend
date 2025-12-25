import { AttendanceRoleAtTime, ClassificationLabel } from '../../common/enums/attendance.enum';
import { ActivityType, ChildGroup, TargetingCode, Town } from '../../common/enums/activity.enum';
declare const PARTICIPANT_ROLES: readonly [...AttendanceRoleAtTime[], "external"];
export declare class AttendanceRosterParticipantDto {
    userId: string;
    fullName: string;
    role: (typeof PARTICIPANT_ROLES)[number];
    group?: ChildGroup;
    profileImageUrl?: string;
    classificationLabel?: ClassificationLabel;
    present?: boolean;
}
export declare class AttendanceRosterResponseDto {
    activityId: string;
    activityType: ActivityType;
    activityTown: Town;
    targetingCode: TargetingCode;
    startDate: Date;
    endDate: Date;
    scopeTown?: Town;
    takenAt?: Date;
    locked: boolean;
    lockReason?: string;
    classificationLabels: ClassificationLabel[];
    participants: AttendanceRosterParticipantDto[];
    externalEntries?: Array<{
        externalId: string;
        fullName: string;
        classificationLabel: ClassificationLabel;
    }>;
}
export declare class AttendanceEligibleChildDto {
    userId: string;
    fullName: string;
    group?: ChildGroup;
    profileImageUrl?: string;
}
export declare class AttendanceEligibleChildrenResponseDto {
    activityId: string;
    query: string;
    scopeTown?: Town;
    results: AttendanceEligibleChildDto[];
}
export {};
