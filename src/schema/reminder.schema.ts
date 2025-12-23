import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Channel, ReminderKind, ReminderStatus } from '../common/enums/notification.enum';

export type ReminderDocument = HydratedDocument<Reminder>;

@Schema({ _id: false })
class ExpectedResponse {
    @Prop()
    label?: string;

    @Prop()
    value?: string;
}

@Schema({ timestamps: true })
export class Reminder {
    @Prop({ type: String, enum: ReminderKind, default: ReminderKind.Custom })
    kind: ReminderKind;

    @Prop({ type: Types.ObjectId, ref: 'User' })
    createdByUserId?: Types.ObjectId;

    @Prop({ required: true })
    message: string;

    @Prop({ type: String, enum: Channel, default: Channel.WhatsApp })
    channel: Channel;

    @Prop()
    schedule?: string;

    @Prop({ type: [String], default: [] })
    recipients: string[];

    @Prop({ type: [ExpectedResponse], default: [] })
    expectedResponses: ExpectedResponse[];

    @Prop({ type: String, enum: ReminderStatus, default: ReminderStatus.Draft })
    status: ReminderStatus;

    @Prop({ type: Object })
    context?: Record<string, any>;
}

export const ReminderSchema = SchemaFactory.createForClass(Reminder);
ReminderSchema.index({ status: 1 });
