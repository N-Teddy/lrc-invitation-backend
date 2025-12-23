import { ChildGroup, TargetingCode } from '../enums/activity.enum';
import { CHILD_GROUP_ORDER } from '../constants/groups.constants';
import { targetGroupsForTargetingCode } from './activity-targeting.util';

export function isEligibleChildForActivity(targetingCode: TargetingCode, childGroup: ChildGroup) {
    const targetGroups = targetGroupsForTargetingCode(targetingCode);
    const indexes = targetGroups.map((g) => CHILD_GROUP_ORDER.indexOf(g)).filter((i) => i >= 0);

    if (!indexes.length) {
        return true;
    }

    const minIndex = Math.min(...indexes);
    const childIndex = CHILD_GROUP_ORDER.indexOf(childGroup);
    if (childIndex < 0) {
        return true;
    }

    // Higher groups can attend lower-group activities; lower groups cannot attend higher-group activities.
    return childIndex >= minIndex;
}
