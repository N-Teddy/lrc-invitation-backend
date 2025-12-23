import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { ChildGroup } from '../common/enums/activity.enum';

export type ChildProfileDocument = HydratedDocument<ChildProfile>;

@Schema({ timestamps: true })
export class ChildProfile {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
    userId: Types.ObjectId;

    @Prop({ type: String, enum: ChildGroup })
    currentGroup?: ChildGroup;

    @Prop()
    groupComputedAt?: Date;

    @Prop({ default: false })
    adultOverrideAllowed?: boolean;

    @Prop()
    lastGroupChangeReminderAt?: Date;
}

export const ChildProfileSchema = SchemaFactory.createForClass(ChildProfile);
ChildProfileSchema.index({ userId: 1 }, { unique: true });
ChildProfileSchema.index({ currentGroup: 1 });
