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
exports.MonitorProfileSchema = exports.MonitorProfile = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const user_enum_1 = require("../common/enums/user.enum");
const activity_enum_1 = require("../common/enums/activity.enum");
let MonitorProfile = class MonitorProfile {
};
exports.MonitorProfile = MonitorProfile;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User', required: true, unique: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], MonitorProfile.prototype, "userId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: user_enum_1.MonitorLevel }),
    __metadata("design:type", String)
], MonitorProfile.prototype, "level", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], MonitorProfile.prototype, "probationStartDate", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], MonitorProfile.prototype, "probationEndDate", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: activity_enum_1.Town }),
    __metadata("design:type", String)
], MonitorProfile.prototype, "homeTown", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true }),
    __metadata("design:type", String)
], MonitorProfile.prototype, "preferredLanguage", void 0);
exports.MonitorProfile = MonitorProfile = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], MonitorProfile);
exports.MonitorProfileSchema = mongoose_1.SchemaFactory.createForClass(MonitorProfile);
exports.MonitorProfileSchema.index({ userId: 1 }, { unique: true });
exports.MonitorProfileSchema.index({ homeTown: 1 });
exports.MonitorProfileSchema.index({ level: 1 });
//# sourceMappingURL=monitor-profile.schema.js.map