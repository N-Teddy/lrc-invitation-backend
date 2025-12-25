"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeGroupFromAge = computeGroupFromAge;
const activity_enum_1 = require("../enums/activity.enum");
function computeGroupFromAge(ageYears, bands) {
    for (const band of bands) {
        if (ageYears >= band.minAgeYears && ageYears <= band.maxAgeYears) {
            return band.group;
        }
    }
    return activity_enum_1.ChildGroup.D;
}
//# sourceMappingURL=age-group.util.js.map