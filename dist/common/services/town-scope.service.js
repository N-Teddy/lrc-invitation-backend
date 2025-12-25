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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TownScopeService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const monitor_profile_schema_1 = require("../../schema/monitor-profile.schema");
let TownScopeService = class TownScopeService {
    constructor(monitorProfileModel) {
        this.monitorProfileModel = monitorProfileModel;
    }
    async resolveMonitorTown(currentUser) {
        const userId = currentUser?._id ?? currentUser?.id;
        if (!userId)
            return undefined;
        const profile = await this.monitorProfileModel
            .findOne({ userId: new mongoose_2.Types.ObjectId(String(userId)) })
            .lean()
            .exec();
        return (profile?.homeTown ?? currentUser?.originTown);
    }
};
exports.TownScopeService = TownScopeService;
exports.TownScopeService = TownScopeService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(monitor_profile_schema_1.MonitorProfile.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], TownScopeService);
//# sourceMappingURL=town-scope.service.js.map