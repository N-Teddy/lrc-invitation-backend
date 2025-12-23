import { ChildGroup } from '../enums/activity.enum';
import { AgeBand } from '../constants/groups.constants';

export function computeGroupFromAge(ageYears: number, bands: AgeBand[]): ChildGroup {
    for (const band of bands) {
        if (ageYears >= band.minAgeYears && ageYears <= band.maxAgeYears) {
            return band.group;
        }
    }
    // If out of range but still considered a child, keep the highest group.
    return ChildGroup.D;
}
