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
exports.JobRunSchema = exports.JobRun = void 0;
const mongoose_1 = require("@nestjs/mongoose");
let JobRun = class JobRun {
};
exports.JobRun = JobRun;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], JobRun.prototype, "jobKey", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], JobRun.prototype, "runKey", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object }),
    __metadata("design:type", Object)
], JobRun.prototype, "meta", void 0);
exports.JobRun = JobRun = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], JobRun);
exports.JobRunSchema = mongoose_1.SchemaFactory.createForClass(JobRun);
exports.JobRunSchema.index({ jobKey: 1, runKey: 1 }, { unique: true });
exports.JobRunSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 365 * 2 });
//# sourceMappingURL=job-run.schema.js.map