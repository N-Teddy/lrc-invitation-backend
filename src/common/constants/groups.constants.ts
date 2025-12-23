import { ChildGroup } from '../enums/activity.enum';

export interface AgeBand {
    group: ChildGroup;
    minAgeYears: number;
    maxAgeYears: number;
}

export const DEFAULT_AGE_TO_GROUP_MAPPING: AgeBand[] = [
    { group: ChildGroup.PreA, minAgeYears: 0, maxAgeYears: 5 },
    { group: ChildGroup.A, minAgeYears: 6, maxAgeYears: 8 },
    { group: ChildGroup.B, minAgeYears: 9, maxAgeYears: 11 },
    { group: ChildGroup.C, minAgeYears: 12, maxAgeYears: 14 },
    { group: ChildGroup.D, minAgeYears: 15, maxAgeYears: 18 },
];

export const CHILD_GROUP_ORDER: ChildGroup[] = [
    ChildGroup.PreA,
    ChildGroup.A,
    ChildGroup.B,
    ChildGroup.C,
    ChildGroup.D,
];
