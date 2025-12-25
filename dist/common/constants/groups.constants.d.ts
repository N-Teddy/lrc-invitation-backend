import { ChildGroup } from '../enums/activity.enum';
export interface AgeBand {
    group: ChildGroup;
    minAgeYears: number;
    maxAgeYears: number;
}
export declare const DEFAULT_AGE_TO_GROUP_MAPPING: AgeBand[];
export declare const CHILD_GROUP_ORDER: ChildGroup[];
