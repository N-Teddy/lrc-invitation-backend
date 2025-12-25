"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isEligibleChildForActivity = isEligibleChildForActivity;
const groups_constants_1 = require("../constants/groups.constants");
const activity_targeting_util_1 = require("./activity-targeting.util");
function isEligibleChildForActivity(targetingCode, childGroup) {
    const targetGroups = (0, activity_targeting_util_1.targetGroupsForTargetingCode)(targetingCode);
    const indexes = targetGroups.map((g) => groups_constants_1.CHILD_GROUP_ORDER.indexOf(g)).filter((i) => i >= 0);
    if (!indexes.length) {
        return true;
    }
    const minIndex = Math.min(...indexes);
    const childIndex = groups_constants_1.CHILD_GROUP_ORDER.indexOf(childGroup);
    if (childIndex < 0) {
        return true;
    }
    return childIndex >= minIndex;
}
//# sourceMappingURL=attendance-eligibility.util.js.map