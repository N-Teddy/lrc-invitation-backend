"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttendanceSchema = exports.Attendance = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const attendance_enum_1 = require("../common/enums/attendance.enum");
const activity_enum_1 = require("../common/enums/activity.enum");
let AttendanceEntry = class AttendanceEntry {
};
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], AttendanceEntry.prototype, "userId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Boolean)
], AttendanceEntry.prototype, "present", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: attendance_enum_1.AttendanceRoleAtTime, required: true }),
    __metadata("design:type", String)
], AttendanceEntry.prototype, "roleAtTime", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: activity_enum_1.Town }),
    __metadata("design:type", String)
], AttendanceEntry.prototype, "originTownAtTime", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: activity_enum_1.ChildGroup }),
    __metadata("design:type", String)
], AttendanceEntry.prototype, "groupAtTime", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: attendance_enum_1.ClassificationLabel }),
    __metadata("design:type", String)
], AttendanceEntry.prototype, "classificationLabel", void 0);
AttendanceEntry = __decorate([
    (0, mongoose_1.Schema)({ _id: false })
], AttendanceEntry);
let ExternalAttendanceEntry = class ExternalAttendanceEntry {
};
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: attendance_enum_1.ClassificationLabel, required: true }),
    __metadata("design:type", String)
], ExternalAttendanceEntry.prototype, "classificationLabel", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], ExternalAttendanceEntry.prototype, "externalId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], ExternalAttendanceEntry.prototype, "fullName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: activity_enum_1.Town }),
    __metadata("design:type", String)
], ExternalAttendanceEntry.prototype, "scopeTown", void 0);
ExternalAttendanceEntry = __decorate([
    (0, mongoose_1.Schema)({ _id: false })
], ExternalAttendanceEntry);
let Attendance = class Attendance {
};
exports.Attendance = Attendance;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Activity', required: true, unique: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Attendance.prototype, "activityId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User' }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Attendance.prototype, "takenByUserId", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], Attendance.prototype, "takenAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [AttendanceEntry], default: [] }),
    __metadata("design:type", Array)
], Attendance.prototype, "entries", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [ExternalAttendanceEntry], default: [] }),
    __metadata("design:type", Array)
], Attendance.prototype, "externalEntries", void 0);
exports.Attendance = Attendance = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Attendance);
exports.AttendanceSchema = mongoose_1.SchemaFactory.createForClass(Attendance);
exports.AttendanceSchema.index({ activityId: 1 }, { unique: true });
exports.AttendanceSchema.index({ takenAt: 1 });
//# sourceMappingURL=attendance.schema.js.map