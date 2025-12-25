"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.targetGroupsForTargetingCode = targetGroupsForTargetingCode;
exports.isValidConferenceDuration = isValidConferenceDuration;
const activity_enum_1 = require("../enums/activity.enum");
function targetGroupsForTargetingCode(code) {
    switch (code) {
        case activity_enum_1.TargetingCode.PreA:
            return [activity_enum_1.ChildGroup.PreA];
        case activity_enum_1.TargetingCode.AB:
            return [activity_enum_1.ChildGroup.A, activity_enum_1.ChildGroup.B];
        case activity_enum_1.TargetingCode.CD:
            return [activity_enum_1.ChildGroup.C, activity_enum_1.ChildGroup.D];
        case activity_enum_1.TargetingCode.ABCD:
        default:
            return [activity_enum_1.ChildGroup.A, activity_enum_1.ChildGroup.B, activity_enum_1.ChildGroup.C, activity_enum_1.ChildGroup.D, activity_enum_1.ChildGroup.PreA];
    }
}
function isValidConferenceDuration(days) {
    return days === 2 || days === 5;
}
//# sourceMappingURL=activity-targeting.util.js.map