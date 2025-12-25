"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DirectoryModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const directory_controller_1 = require("./directory.controller");
const directory_service_1 = require("./directory.service");
const user_schema_1 = require("../schema/user.schema");
const monitor_profile_schema_1 = require("../schema/monitor-profile.schema");
const town_scope_service_1 = require("../common/services/town-scope.service");
let DirectoryModule = class DirectoryModule {
};
exports.DirectoryModule = DirectoryModule;
exports.DirectoryModule = DirectoryModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: user_schema_1.User.name, schema: user_schema_1.UserSchema },
                { name: monitor_profile_schema_1.MonitorProfile.name, schema: monitor_profile_schema_1.MonitorProfileSchema },
            ]),
        ],
        controllers: [directory_controller_1.DirectoryController],
        providers: [directory_service_1.DirectoryService, town_scope_service_1.TownScopeService],
        exports: [directory_service_1.DirectoryService],
    })
], DirectoryModule);
//# sourceMappingURL=directory.module.js.map