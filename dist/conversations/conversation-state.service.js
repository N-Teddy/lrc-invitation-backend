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
exports.ConversationStateService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const conversation_state_schema_1 = require("../schema/conversation-state.schema");
let ConversationStateService = class ConversationStateService {
    constructor(conversationStateModel) {
        this.conversationStateModel = conversationStateModel;
    }
    async upsert(params) {
        const update = {
            userId: new mongoose_2.Types.ObjectId(params.userId),
            contextType: params.contextType,
            contextId: params.contextId,
            state: params.state,
            allowedResponses: params.allowedResponses,
            expiresAt: params.expiresAt,
            lastNotificationId: params.lastNotificationId
                ? new mongoose_2.Types.ObjectId(params.lastNotificationId)
                : undefined,
        };
        return this.conversationStateModel
            .findOneAndUpdate({
            userId: new mongoose_2.Types.ObjectId(params.userId),
            contextType: params.contextType,
            contextId: params.contextId,
        }, { $set: update }, { upsert: true, new: true })
            .lean()
            .exec();
    }
    async get(userId, contextType, contextId) {
        return this.conversationStateModel
            .findOne({
            userId: new mongoose_2.Types.ObjectId(userId),
            contextType,
            contextId,
        })
            .lean()
            .exec();
    }
    async complete(userId, contextType, contextId) {
        return this.conversationStateModel
            .findOneAndUpdate({
            userId: new mongoose_2.Types.ObjectId(userId),
            contextType,
            contextId,
        }, { $set: { state: 'completed', expiresAt: new Date() } }, { new: true })
            .lean()
            .exec();
    }
};
exports.ConversationStateService = ConversationStateService;
exports.ConversationStateService = ConversationStateService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(conversation_state_schema_1.ConversationState.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], ConversationStateService);
//# sourceMappingURL=conversation-state.service.js.map