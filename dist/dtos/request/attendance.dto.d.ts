import { ClassificationLabel } from '../../common/enums/attendance.enum';
export declare class AttendanceEntryRequestDto {
    userId: string;
    present: boolean;
}
export declare class ExternalAttendanceEntryRequestDto {
    classificationLabel: ClassificationLabel;
    externalId: string;
    fullName: string;
}
export declare class UpsertAttendanceDto {
    entries: AttendanceEntryRequestDto[];
    externalEntries?: ExternalAttendanceEntryRequestDto[];
}
