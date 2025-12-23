import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import {
    Channel,
    NotificationContextType,
    NotificationStatus,
} from '../common/enums/notification.enum';

export type NotificationDocument = HydratedDocument<Notification>;

@Schema({ _id: false })
class InteractiveOption {
    @Prop()
    id?: string;

    @Prop()
    label?: string;
}

@Schema({ timestamps: true })
export class Notification {
    @Prop({ type: String, enum: Channel, default: Channel.Email })
    channel: Channel;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    toUserId: Types.ObjectId;

    @Prop({ type: String, enum: NotificationContextType, required: true })
    contextType: NotificationContextType;

    @Prop({ type: String, required: true })
    contextId: string;

    @Prop()
    templateName?: string;

    @Prop()
    templateLanguage?: string;

    @Prop()
    languageUsed?: string;

    @Prop({ default: false })
    languageFallbackUsed?: boolean;

    @Prop({ type: [InteractiveOption], default: [] })
    interactiveOptions: InteractiveOption[];

    @Prop({ type: String, enum: NotificationStatus, default: NotificationStatus.Queued })
    status: NotificationStatus;

    @Prop()
    providerMessageId?: string;

    @Prop()
    error?: string;

    @Prop()
    sentAt?: Date;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
NotificationSchema.index({ toUserId: 1, createdAt: 1 });
NotificationSchema.index({ contextType: 1, contextId: 1 });
NotificationSchema.index({ status: 1 });
