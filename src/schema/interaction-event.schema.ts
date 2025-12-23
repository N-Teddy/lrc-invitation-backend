import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { NotificationContextType } from '../common/enums/notification.enum';

export type InteractionEventDocument = HydratedDocument<InteractionEvent>;

@Schema({ timestamps: true })
export class InteractionEvent {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    userId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Notification' })
    notificationId?: Types.ObjectId;

    @Prop({ type: String, enum: NotificationContextType, required: true })
    contextType: NotificationContextType;

    @Prop({ type: String, required: true })
    contextId: string;

    @Prop({ required: true })
    actionId: string;

    @Prop({ type: Object })
    meta?: Record<string, any>;
}

export const InteractionEventSchema = SchemaFactory.createForClass(InteractionEvent);
InteractionEventSchema.index({ userId: 1, createdAt: -1 });
InteractionEventSchema.index({ contextType: 1, contextId: 1, createdAt: -1 });
