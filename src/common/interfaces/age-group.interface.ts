import { AgeGroup } from '../enums/age-group.enum';

export interface AgeGroupConfig {
    group: AgeGroup;
    minAge: number;
    maxAge: number;
}

export interface ChildWithGroup {
    childId: number;
    name: string;
    birthDate: Date;
    currentAge: number;
    currentGroup: AgeGroup;
    isNearingNextGroup: boolean;
    nextGroup?: AgeGroup;
    monthsUntilNextGroup?: number;
}
