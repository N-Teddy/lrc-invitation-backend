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
exports.DirectoryService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const town_scope_service_1 = require("../common/services/town-scope.service");
const user_enum_1 = require("../common/enums/user.enum");
const user_schema_1 = require("../schema/user.schema");
let DirectoryService = class DirectoryService {
    constructor(userModel, townScopeService) {
        this.userModel = userModel;
        this.townScopeService = townScopeService;
    }
    async listMonitors(currentUser, query) {
        const town = await this.townScopeService.resolveMonitorTown(currentUser);
        if (!town)
            throw new common_1.ForbiddenException('Monitor town not set');
        const limit = Math.min(Math.max(query.limit ?? 20, 1), 50);
        const q = (query.q ?? '').trim();
        const ids = (query.ids ?? []).map((x) => String(x)).filter(Boolean);
        const mongoQuery = {
            role: user_enum_1.UserRole.Monitor,
            originTown: town,
            lifecycleStatus: user_enum_1.LifecycleStatus.Active,
        };
        if (ids.length) {
            mongoQuery._id = { $in: ids.map((id) => new mongoose_2.Types.ObjectId(id)) };
        }
        else if (q.length >= 2) {
            mongoQuery.fullName = {
                $regex: q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
                $options: 'i',
            };
        }
        const users = await this.userModel
            .find(mongoQuery)
            .select({ _id: 1, fullName: 1, originTown: 1, monitorLevel: 1, profileImage: 1 })
            .sort({ fullName: 1 })
            .limit(limit)
            .lean()
            .exec();
        return users.map((u) => ({
            userId: String(u._id),
            fullName: u.fullName,
            originTown: u.originTown,
            monitorLevel: u.monitorLevel,
            profileImageUrl: u.profileImage?.url,
        }));
    }
};
exports.DirectoryService = DirectoryService;
exports.DirectoryService = DirectoryService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        town_scope_service_1.TownScopeService])
], DirectoryService);
//# sourceMappingURL=directory.service.js.map