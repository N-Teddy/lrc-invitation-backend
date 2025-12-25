import { AttendanceRoleAtTime, ClassificationLabel } from '../../common/enums/attendance.enum';
import { ChildGroup, Town } from '../../common/enums/activity.enum';
export declare class AttendanceEntryResponseDto {
    userId: string;
    present: boolean;
    roleAtTime: AttendanceRoleAtTime;
    originTownAtTime?: Town;
    groupAtTime?: ChildGroup;
    classificationLabel?: ClassificationLabel;
}
export declare class ExternalAttendanceEntryResponseDto {
    externalId: string;
    fullName: string;
    classificationLabel: ClassificationLabel;
    scopeTown?: Town;
}
export declare class AttendanceResponseDto {
    id?: string;
    activityId: string;
    takenByUserId?: string;
    takenAt?: Date;
    entries: AttendanceEntryResponseDto[];
    externalEntries?: ExternalAttendanceEntryResponseDto[];
    createdAt?: Date;
    updatedAt?: Date;
}
