"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CHILD_GROUP_ORDER = exports.DEFAULT_AGE_TO_GROUP_MAPPING = void 0;
const activity_enum_1 = require("../enums/activity.enum");
exports.DEFAULT_AGE_TO_GROUP_MAPPING = [
    { group: activity_enum_1.ChildGroup.PreA, minAgeYears: 0, maxAgeYears: 5 },
    { group: activity_enum_1.ChildGroup.A, minAgeYears: 6, maxAgeYears: 8 },
    { group: activity_enum_1.ChildGroup.B, minAgeYears: 9, maxAgeYears: 11 },
    { group: activity_enum_1.ChildGroup.C, minAgeYears: 12, maxAgeYears: 14 },
    { group: activity_enum_1.ChildGroup.D, minAgeYears: 15, maxAgeYears: 18 },
];
exports.CHILD_GROUP_ORDER = [
    activity_enum_1.ChildGroup.PreA,
    activity_enum_1.ChildGroup.A,
    activity_enum_1.ChildGroup.B,
    activity_enum_1.ChildGroup.C,
    activity_enum_1.ChildGroup.D,
];
//# sourceMappingURL=groups.constants.js.map