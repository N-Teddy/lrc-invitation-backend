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
exports.ChildProfileSchema = exports.ChildProfile = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const activity_enum_1 = require("../common/enums/activity.enum");
let GuardianContact = class GuardianContact {
};
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], GuardianContact.prototype, "fullName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], GuardianContact.prototype, "phoneE164", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], GuardianContact.prototype, "relationship", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true, lowercase: true }),
    __metadata("design:type", String)
], GuardianContact.prototype, "email", void 0);
GuardianContact = __decorate([
    (0, mongoose_1.Schema)({ _id: false })
], GuardianContact);
let ChildProfile = class ChildProfile {
};
exports.ChildProfile = ChildProfile;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User', required: true, unique: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], ChildProfile.prototype, "userId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [GuardianContact], default: [] }),
    __metadata("design:type", Array)
], ChildProfile.prototype, "guardians", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: activity_enum_1.ChildGroup }),
    __metadata("design:type", String)
], ChildProfile.prototype, "currentGroup", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], ChildProfile.prototype, "groupComputedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], ChildProfile.prototype, "adultOverrideAllowed", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], ChildProfile.prototype, "lastGroupChangeReminderAt", void 0);
exports.ChildProfile = ChildProfile = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], ChildProfile);
exports.ChildProfileSchema = mongoose_1.SchemaFactory.createForClass(ChildProfile);
exports.ChildProfileSchema.index({ userId: 1 }, { unique: true });
exports.ChildProfileSchema.index({ currentGroup: 1 });
//# sourceMappingURL=child-profile.schema.js.map