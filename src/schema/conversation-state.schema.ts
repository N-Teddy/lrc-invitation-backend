import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { NotificationContextType } from '../common/enums/notification.enum';

export type ConversationStateDocument = HydratedDocument<ConversationState>;

@Schema({ timestamps: true })
export class ConversationState {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    userId: Types.ObjectId;

    @Prop({ type: String, enum: NotificationContextType, required: true })
    contextType: NotificationContextType;

    @Prop({ type: String, required: true })
    contextId: string;

    @Prop({ required: true })
    state: string;

    @Prop({ type: [String], default: [] })
    allowedResponses: string[];

    @Prop({ type: Date, required: true })
    expiresAt: Date;

    @Prop({ type: Types.ObjectId, ref: 'Notification' })
    lastNotificationId?: Types.ObjectId;
}

export const ConversationStateSchema = SchemaFactory.createForClass(ConversationState);
ConversationStateSchema.index({ userId: 1, contextType: 1, contextId: 1 }, { unique: true });
ConversationStateSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
