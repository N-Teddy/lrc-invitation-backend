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
exports.AttendanceController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const activity_enum_1 = require("../common/enums/activity.enum");
const user_enum_1 = require("../common/enums/user.enum");
const attendance_dto_1 = require("../dtos/request/attendance.dto");
const attendance_dto_2 = require("../dtos/response/attendance.dto");
const attendance_roster_dto_1 = require("../dtos/response/attendance-roster.dto");
const attendance_service_1 = require("./attendance.service");
let AttendanceController = class AttendanceController {
    constructor(attendanceService) {
        this.attendanceService = attendanceService;
    }
    get(activityId, scopeTown, currentUser) {
        return this.attendanceService.getByActivityId(activityId, currentUser, scopeTown);
    }
    roster(activityId, scopeTown, currentUser) {
        return this.attendanceService.getRoster(activityId, currentUser, scopeTown);
    }
    eligibleChildren(activityId, query = '', limit = '15', scopeTown, currentUser) {
        return this.attendanceService.searchEligibleChildren(activityId, query, Number(limit), currentUser, scopeTown);
    }
    upsert(activityId, dto, scopeTown, currentUser) {
        return this.attendanceService.upsertForActivity(activityId, dto, currentUser, scopeTown);
    }
};
exports.AttendanceController = AttendanceController;
__decorate([
    (0, roles_decorator_1.Roles)([user_enum_1.UserRole.Monitor]),
    (0, common_1.Get)(),
    (0, swagger_1.ApiOkResponse)({ type: attendance_dto_2.AttendanceResponseDto }),
    __param(0, (0, common_1.Param)('activityId')),
    __param(1, (0, common_1.Query)('scopeTown')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], AttendanceController.prototype, "get", null);
__decorate([
    (0, roles_decorator_1.Roles)([user_enum_1.UserRole.Monitor]),
    (0, common_1.Get)('roster'),
    (0, swagger_1.ApiOkResponse)({ type: attendance_roster_dto_1.AttendanceRosterResponseDto }),
    __param(0, (0, common_1.Param)('activityId')),
    __param(1, (0, common_1.Query)('scopeTown')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], AttendanceController.prototype, "roster", null);
__decorate([
    (0, roles_decorator_1.Roles)([user_enum_1.UserRole.Monitor]),
    (0, common_1.Get)('eligible-children'),
    (0, swagger_1.ApiOkResponse)({ type: attendance_roster_dto_1.AttendanceEligibleChildrenResponseDto }),
    __param(0, (0, common_1.Param)('activityId')),
    __param(1, (0, common_1.Query)('query')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('scopeTown')),
    __param(4, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, String, Object]),
    __metadata("design:returntype", void 0)
], AttendanceController.prototype, "eligibleChildren", null);
__decorate([
    (0, roles_decorator_1.Roles)([user_enum_1.UserRole.Monitor]),
    (0, common_1.Put)(),
    (0, swagger_1.ApiOkResponse)({ type: attendance_dto_2.AttendanceResponseDto }),
    __param(0, (0, common_1.Param)('activityId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Query)('scopeTown')),
    __param(3, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, attendance_dto_1.UpsertAttendanceDto, String, Object]),
    __metadata("design:returntype", void 0)
], AttendanceController.prototype, "upsert", null);
exports.AttendanceController = AttendanceController = __decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiTags)('attendance'),
    (0, common_1.Controller)('activities/:activityId/attendance'),
    __metadata("design:paramtypes", [attendance_service_1.AttendanceService])
], AttendanceController);
//# sourceMappingURL=attendance.controller.js.map