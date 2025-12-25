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
exports.InteractionsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const notification_enum_1 = require("../common/enums/notification.enum");
const user_enum_1 = require("../common/enums/user.enum");
const interaction_dto_1 = require("../dtos/request/interaction.dto");
const interaction_dto_2 = require("../dtos/response/interaction.dto");
const interactions_service_1 = require("./interactions.service");
let InteractionsController = class InteractionsController {
    constructor(interactionsService) {
        this.interactionsService = interactionsService;
    }
    listMine(currentUser, query) {
        return this.interactionsService.listMine(currentUser, query.limit ?? 50, query.cursor);
    }
    listByContext(contextType, contextId, currentUser, query) {
        return this.interactionsService.listByContext(contextType, contextId, currentUser, query.limit ?? 50, query.cursor);
    }
};
exports.InteractionsController = InteractionsController;
__decorate([
    (0, roles_decorator_1.Roles)([user_enum_1.UserRole.Monitor]),
    (0, common_1.Get)('me'),
    (0, swagger_1.ApiOkResponse)({ type: interaction_dto_2.InteractionEventsListResponseDto }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, interaction_dto_1.InteractionListQueryDto]),
    __metadata("design:returntype", void 0)
], InteractionsController.prototype, "listMine", null);
__decorate([
    (0, roles_decorator_1.Roles)([user_enum_1.UserRole.Monitor]),
    (0, common_1.Get)(':contextType/:contextId'),
    (0, swagger_1.ApiOkResponse)({ type: interaction_dto_2.InteractionEventsListResponseDto }),
    __param(0, (0, common_1.Param)('contextType')),
    __param(1, (0, common_1.Param)('contextId')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __param(3, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, interaction_dto_1.InteractionListQueryDto]),
    __metadata("design:returntype", void 0)
], InteractionsController.prototype, "listByContext", null);
exports.InteractionsController = InteractionsController = __decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiTags)('interactions'),
    (0, common_1.Controller)('interactions'),
    __metadata("design:paramtypes", [interactions_service_1.InteractionsService])
], InteractionsController);
//# sourceMappingURL=interactions.controller.js.map