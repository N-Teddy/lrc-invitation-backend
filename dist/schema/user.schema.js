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
exports.UserSchema = exports.User = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const user_enum_1 = require("../common/enums/user.enum");
const activity_enum_1 = require("../common/enums/activity.enum");
let WhatsAppContact = class WhatsAppContact {
};
__decorate([
    (0, mongoose_1.Prop)({ trim: true }),
    __metadata("design:type", String)
], WhatsAppContact.prototype, "phoneE164", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: true }),
    __metadata("design:type", Boolean)
], WhatsAppContact.prototype, "optIn", void 0);
WhatsAppContact = __decorate([
    (0, mongoose_1.Schema)({ _id: false })
], WhatsAppContact);
let ProfileImageRef = class ProfileImageRef {
};
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], ProfileImageRef.prototype, "url", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], ProfileImageRef.prototype, "provider", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], ProfileImageRef.prototype, "mimeType", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Number)
], ProfileImageRef.prototype, "sizeBytes", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], ProfileImageRef.prototype, "updatedAt", void 0);
ProfileImageRef = __decorate([
    (0, mongoose_1.Schema)({ _id: false })
], ProfileImageRef);
let User = class User {
};
exports.User = User;
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], User.prototype, "fullName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true, lowercase: true }),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: user_enum_1.UserRole, required: true }),
    __metadata("design:type", String)
], User.prototype, "role", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: user_enum_1.MonitorLevel }),
    __metadata("design:type", String)
], User.prototype, "monitorLevel", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], User.prototype, "dateOfBirth", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: activity_enum_1.Town }),
    __metadata("design:type", String)
], User.prototype, "originTown", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true }),
    __metadata("design:type", String)
], User.prototype, "preferredLanguage", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: WhatsAppContact }),
    __metadata("design:type", WhatsAppContact)
], User.prototype, "whatsApp", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: ProfileImageRef }),
    __metadata("design:type", ProfileImageRef)
], User.prototype, "profileImage", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], User.prototype, "registrationPendingApproval", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], User.prototype, "magicToken", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], User.prototype, "magicExpiresAt", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], User.prototype, "googleId", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], User.prototype, "googleEmail", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], User.prototype, "googleLinkedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: user_enum_1.LifecycleStatus, default: user_enum_1.LifecycleStatus.Active }),
    __metadata("design:type", String)
], User.prototype, "lifecycleStatus", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], User.prototype, "archivedReason", void 0);
exports.User = User = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], User);
exports.UserSchema = mongoose_1.SchemaFactory.createForClass(User);
exports.UserSchema.index({ role: 1 });
exports.UserSchema.index({ originTown: 1 });
exports.UserSchema.index({ preferredLanguage: 1 });
exports.UserSchema.index({ lifecycleStatus: 1 });
exports.UserSchema.index({ 'whatsApp.phoneE164': 1 }, { unique: false });
exports.UserSchema.index({ email: 1 }, { unique: true, partialFilterExpression: { email: { $type: 'string' } } });
exports.UserSchema.index({ googleId: 1 }, { unique: true, sparse: true });
//# sourceMappingURL=user.schema.js.map