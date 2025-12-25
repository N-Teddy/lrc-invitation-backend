import { ChildGroup } from '../../common/enums/activity.enum';
export declare class AgeBandDto {
    group: ChildGroup;
    minAgeYears: number;
    maxAgeYears: number;
}
export declare class AgeToGroupMappingResponseDto {
    bands: AgeBandDto[];
}
export declare class GroupRecomputeResultDto {
    processedChildren: number;
    updatedGroups: number;
    archivedAdults: number;
    remindersCreated: number;
}
