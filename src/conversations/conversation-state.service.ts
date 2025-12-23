import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ConversationState, ConversationStateDocument } from '../schema/conversation-state.schema';
import { NotificationContextType } from '../common/enums/notification.enum';

@Injectable()
export class ConversationStateService {
    constructor(
        @InjectModel(ConversationState.name)
        private readonly conversationStateModel: Model<ConversationStateDocument>,
    ) {}

    async upsert(params: {
        userId: string;
        contextType: NotificationContextType;
        contextId: string;
        state: string;
        allowedResponses: string[];
        expiresAt: Date;
        lastNotificationId?: string;
    }) {
        const update: any = {
            userId: new Types.ObjectId(params.userId),
            contextType: params.contextType,
            contextId: params.contextId,
            state: params.state,
            allowedResponses: params.allowedResponses,
            expiresAt: params.expiresAt,
            lastNotificationId: params.lastNotificationId
                ? new Types.ObjectId(params.lastNotificationId)
                : undefined,
        };

        return this.conversationStateModel
            .findOneAndUpdate(
                {
                    userId: new Types.ObjectId(params.userId),
                    contextType: params.contextType,
                    contextId: params.contextId,
                },
                { $set: update },
                { upsert: true, new: true },
            )
            .lean()
            .exec();
    }

    async get(userId: string, contextType: NotificationContextType, contextId: string) {
        return this.conversationStateModel
            .findOne({
                userId: new Types.ObjectId(userId),
                contextType,
                contextId,
            })
            .lean()
            .exec();
    }

    async complete(userId: string, contextType: NotificationContextType, contextId: string) {
        return this.conversationStateModel
            .findOneAndUpdate(
                {
                    userId: new Types.ObjectId(userId),
                    contextType,
                    contextId,
                },
                { $set: { state: 'completed', expiresAt: new Date() } },
                { new: true },
            )
            .lean()
            .exec();
    }
}
