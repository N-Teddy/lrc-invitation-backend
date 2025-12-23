import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { ActivityType, TargetingCode, Town } from '../common/enums/activity.enum';

export type ActivityDocument = HydratedDocument<Activity>;

@Schema({ timestamps: true })
export class Activity {
    @Prop({ type: String, enum: ActivityType, required: true })
    type: ActivityType;

    @Prop({ type: String, enum: Town, required: true })
    town: Town;

    @Prop({ required: true })
    startDate: Date;

    @Prop({ required: true })
    endDate: Date;

    @Prop()
    conferenceDurationDays?: number;

    @Prop({ type: String, enum: TargetingCode, required: true })
    targetingCode: TargetingCode;

    @Prop({ type: [Types.ObjectId], ref: 'User', default: [] })
    invitedChildrenUserIds: Types.ObjectId[];

    @Prop({ type: [Types.ObjectId], ref: 'User', default: [] })
    invitedMonitorUserIds: Types.ObjectId[];

    @Prop({ type: Types.ObjectId, ref: 'User' })
    createdByUserId?: Types.ObjectId;

    @Prop()
    notes?: string;
}

export const ActivitySchema = SchemaFactory.createForClass(Activity);
ActivitySchema.index({ town: 1, startDate: 1 });
ActivitySchema.index({ type: 1 });
ActivitySchema.index({ targetingCode: 1 });
