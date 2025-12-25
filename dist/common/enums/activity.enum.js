"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Town = exports.ChildGroup = exports.TargetingCode = exports.ActivityType = void 0;
var ActivityType;
(function (ActivityType) {
    ActivityType["Conference"] = "conference";
    ActivityType["Services"] = "services";
    ActivityType["Leisure"] = "leisure";
    ActivityType["Causerie"] = "causerie";
})(ActivityType || (exports.ActivityType = ActivityType = {}));
var TargetingCode;
(function (TargetingCode) {
    TargetingCode["AB"] = "AB";
    TargetingCode["CD"] = "CD";
    TargetingCode["ABCD"] = "ABCD";
    TargetingCode["PreA"] = "Pre A";
})(TargetingCode || (exports.TargetingCode = TargetingCode = {}));
var ChildGroup;
(function (ChildGroup) {
    ChildGroup["PreA"] = "Pre A";
    ChildGroup["A"] = "A";
    ChildGroup["B"] = "B";
    ChildGroup["C"] = "C";
    ChildGroup["D"] = "D";
})(ChildGroup || (exports.ChildGroup = ChildGroup = {}));
var Town;
(function (Town) {
    Town["Douala"] = "Douala";
    Town["Edea"] = "Edea";
    Town["Yaounde"] = "Yaounde";
})(Town || (exports.Town = Town = {}));
//# sourceMappingURL=activity.enum.js.map