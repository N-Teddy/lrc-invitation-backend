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
exports.ActivitiesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const activity_enum_1 = require("../common/enums/activity.enum");
const user_enum_1 = require("../common/enums/user.enum");
const activity_dto_1 = require("../dtos/request/activity.dto");
const activity_dto_2 = require("../dtos/response/activity.dto");
const activity_invitations_dto_1 = require("../dtos/response/activity-invitations.dto");
const conference_eligibility_dto_1 = require("../dtos/response/conference-eligibility.dto");
const activities_service_1 = require("./activities.service");
let ActivitiesController = class ActivitiesController {
    constructor(activitiesService) {
        this.activitiesService = activitiesService;
    }
    create(dto, currentUser) {
        return this.activitiesService.create(dto, currentUser);
    }
    findAll(town, type, from, to, currentUser) {
        return this.activitiesService.findAll({ town, type, from, to }, currentUser);
    }
    findOne(id, currentUser) {
        return this.activitiesService.findOneOrFail(id, currentUser);
    }
    conferenceEligibility(id, currentUser) {
        return this.activitiesService.getConferenceEligibility(id, currentUser);
    }
    update(id, dto, currentUser) {
        return this.activitiesService.update(id, dto, currentUser);
    }
    remove(id, currentUser) {
        return this.activitiesService.remove(id, currentUser);
    }
    regenerateInvitations(id, currentUser) {
        return this.activitiesService.regenerateInvitations(id, currentUser);
    }
    overrideInvitations(id, dto, currentUser) {
        return this.activitiesService.overrideInvitations(id, dto, currentUser);
    }
    invitedChildren(id, currentUser) {
        return this.activitiesService.getInvitedChildrenDetails(id, currentUser);
    }
    eligibleChildren(id, query = '', limit = '15', currentUser) {
        return this.activitiesService.searchEligibleChildrenForInvitations(id, query, Number(limit), currentUser);
    }
};
exports.ActivitiesController = ActivitiesController;
__decorate([
    (0, roles_decorator_1.Roles)([user_enum_1.UserRole.Monitor], [user_enum_1.MonitorLevel.Official, user_enum_1.MonitorLevel.Super]),
    (0, common_1.Post)(),
    (0, swagger_1.ApiCreatedResponse)({ type: activity_dto_2.ActivityResponseDto }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [activity_dto_1.CreateActivityDto, Object]),
    __metadata("design:returntype", void 0)
], ActivitiesController.prototype, "create", null);
__decorate([
    (0, roles_decorator_1.Roles)([user_enum_1.UserRole.Monitor]),
    (0, common_1.Get)(),
    (0, swagger_1.ApiOkResponse)({ type: [activity_dto_2.ActivityResponseDto] }),
    __param(0, (0, common_1.Query)('town')),
    __param(1, (0, common_1.Query)('type')),
    __param(2, (0, common_1.Query)('from')),
    __param(3, (0, common_1.Query)('to')),
    __param(4, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, Object]),
    __metadata("design:returntype", void 0)
], ActivitiesController.prototype, "findAll", null);
__decorate([
    (0, roles_decorator_1.Roles)([user_enum_1.UserRole.Monitor]),
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOkResponse)({ type: activity_dto_2.ActivityResponseDto }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ActivitiesController.prototype, "findOne", null);
__decorate([
    (0, roles_decorator_1.Roles)([user_enum_1.UserRole.Monitor]),
    (0, common_1.Get)(':id/conference-eligibility'),
    (0, swagger_1.ApiOkResponse)({ type: conference_eligibility_dto_1.ConferenceEligibilityResponseDto }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ActivitiesController.prototype, "conferenceEligibility", null);
__decorate([
    (0, roles_decorator_1.Roles)([user_enum_1.UserRole.Monitor], [user_enum_1.MonitorLevel.Official, user_enum_1.MonitorLevel.Super]),
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOkResponse)({ type: activity_dto_2.ActivityResponseDto }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, activity_dto_1.UpdateActivityDto, Object]),
    __metadata("design:returntype", void 0)
], ActivitiesController.prototype, "update", null);
__decorate([
    (0, roles_decorator_1.Roles)([user_enum_1.UserRole.Monitor], [user_enum_1.MonitorLevel.Official, user_enum_1.MonitorLevel.Super]),
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOkResponse)(),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ActivitiesController.prototype, "remove", null);
__decorate([
    (0, roles_decorator_1.Roles)([user_enum_1.UserRole.Monitor], [user_enum_1.MonitorLevel.Official, user_enum_1.MonitorLevel.Super]),
    (0, common_1.Post)(':id/invitations/regenerate'),
    (0, swagger_1.ApiOkResponse)({ type: activity_dto_2.ActivityResponseDto }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ActivitiesController.prototype, "regenerateInvitations", null);
__decorate([
    (0, roles_decorator_1.Roles)([user_enum_1.UserRole.Monitor], [user_enum_1.MonitorLevel.Official, user_enum_1.MonitorLevel.Super]),
    (0, common_1.Patch)(':id/invitations'),
    (0, swagger_1.ApiOkResponse)({ type: activity_dto_2.ActivityResponseDto }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, activity_dto_1.UpdateActivityInvitationsDto, Object]),
    __metadata("design:returntype", void 0)
], ActivitiesController.prototype, "overrideInvitations", null);
__decorate([
    (0, roles_decorator_1.Roles)([user_enum_1.UserRole.Monitor]),
    (0, common_1.Get)(':id/invitations/children'),
    (0, swagger_1.ApiOkResponse)({ type: activity_invitations_dto_1.ActivityInvitedChildrenResponseDto }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ActivitiesController.prototype, "invitedChildren", null);
__decorate([
    (0, roles_decorator_1.Roles)([user_enum_1.UserRole.Monitor], [user_enum_1.MonitorLevel.Official, user_enum_1.MonitorLevel.Super]),
    (0, common_1.Get)(':id/invitations/eligible-children'),
    (0, swagger_1.ApiOkResponse)({ type: activity_invitations_dto_1.ActivityEligibleChildrenResponseDto }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('query')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, Object]),
    __metadata("design:returntype", void 0)
], ActivitiesController.prototype, "eligibleChildren", null);
exports.ActivitiesController = ActivitiesController = __decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiTags)('activities'),
    (0, common_1.Controller)('activities'),
    __metadata("design:paramtypes", [activities_service_1.ActivitiesService])
], ActivitiesController);
//# sourceMappingURL=activities.controller.js.map