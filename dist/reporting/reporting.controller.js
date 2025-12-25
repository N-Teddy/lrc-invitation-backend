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
exports.ReportingController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const activity_enum_1 = require("../common/enums/activity.enum");
const user_enum_1 = require("../common/enums/user.enum");
const reporting_dto_1 = require("../dtos/response/reporting.dto");
const reporting_service_1 = require("./reporting.service");
let ReportingController = class ReportingController {
    constructor(reportingService) {
        this.reportingService = reportingService;
    }
    async activityAttendanceStats(activityId, currentUser) {
        return this.reportingService.getActivityAttendanceStatsForUser(activityId, currentUser);
    }
    async yearlyAttendanceSummary(yearStr, currentUser, town) {
        const year = Number(yearStr);
        const isSuper = currentUser?.monitorLevel === user_enum_1.MonitorLevel.Super;
        if (!isSuper) {
            return this.reportingService.getYearlyAttendanceSummaryForUser(year, currentUser);
        }
        if (!town) {
            throw new common_1.BadRequestException('Town is required for yearly summary');
        }
        return this.reportingService.getYearlyAttendanceSummary(year, { originTown: town });
    }
    async turning19Report(yearStr, town) {
        const year = Number(yearStr);
        return this.reportingService.getTurning19Report(year, { originTown: town });
    }
};
exports.ReportingController = ReportingController;
__decorate([
    (0, roles_decorator_1.Roles)([user_enum_1.UserRole.Monitor]),
    (0, common_1.Get)('activities/:activityId/attendance-stats'),
    (0, swagger_1.ApiOkResponse)({ type: reporting_dto_1.ActivityAttendanceStatsDto }),
    __param(0, (0, common_1.Param)('activityId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ReportingController.prototype, "activityAttendanceStats", null);
__decorate([
    (0, roles_decorator_1.Roles)([user_enum_1.UserRole.Monitor]),
    (0, common_1.Get)('yearly/:year/attendance-summary'),
    (0, swagger_1.ApiOkResponse)({ type: reporting_dto_1.YearlyAttendanceSummaryDto }),
    __param(0, (0, common_1.Param)('year')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Query)('town')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", Promise)
], ReportingController.prototype, "yearlyAttendanceSummary", null);
__decorate([
    (0, roles_decorator_1.Roles)([user_enum_1.UserRole.Monitor], [user_enum_1.MonitorLevel.Super]),
    (0, common_1.Get)('yearly/:year/turning-19'),
    (0, swagger_1.ApiOkResponse)({ type: reporting_dto_1.Turning19ReportDto }),
    __param(0, (0, common_1.Param)('year')),
    __param(1, (0, common_1.Query)('town')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ReportingController.prototype, "turning19Report", null);
exports.ReportingController = ReportingController = __decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiTags)('reports'),
    (0, common_1.Controller)('reports'),
    __metadata("design:paramtypes", [reporting_service_1.ReportingService])
], ReportingController);
//# sourceMappingURL=reporting.controller.js.map