import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Channel, ReminderKind, ReminderStatus } from '../common/enums/notification.enum';

export type ReminderDocument = HydratedDocument<Reminder>;

export enum ReminderScheduleType {
    Once = 'once',
    IntervalMinutes = 'interval_minutes',
    Daily = 'daily',
    Weekly = 'weekly',
    Monthly = 'monthly',
}

@Schema({ _id: false })
class ExpectedResponse {
    @Prop()
    label?: string;

    @Prop()
    value?: string;
}

@Schema({ _id: false })
class ReminderSchedule {
    @Prop({ type: String, enum: ReminderScheduleType })
    type?: ReminderScheduleType;

    // Once
    @Prop()
    runAt?: Date;

    // Interval
    @Prop()
    intervalMinutes?: number;

    // Daily/Weekly/Monthly
    @Prop()
    hour?: number;

    @Prop()
    minute?: number;

    @Prop()
    dayOfWeek?: number;

    @Prop()
    dayOfMonth?: number;
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

    @Prop({ type: ReminderSchedule })
    schedule?: ReminderSchedule;

    @Prop()
    nextRunAt?: Date;

    @Prop()
    lastSentAt?: Date;

    @Prop({ type: [String], default: [] })
    awaitingAckUserIds: string[];

    @Prop({ type: [String], default: [] })
    acknowledgedByUserIds: string[];

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
ReminderSchema.index({ status: 1, nextRunAt: 1 });
