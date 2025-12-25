"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.subtractMonths = subtractMonths;
function subtractMonths(date, months) {
    const d = new Date(date);
    const dayOfMonth = d.getDate();
    d.setDate(1);
    d.setMonth(d.getMonth() - months);
    const daysInTargetMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
    d.setDate(Math.min(dayOfMonth, daysInTargetMonth));
    return d;
}
//# sourceMappingURL=date.util.js.map