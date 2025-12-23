import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { MonitorLevel } from '../common/enums/user.enum';
import { Town } from '../common/enums/activity.enum';

export type MonitorProfileDocument = HydratedDocument<MonitorProfile>;

@Schema({ timestamps: true })
export class MonitorProfile {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
    userId: Types.ObjectId;

    @Prop({ type: String, enum: MonitorLevel })
    level?: MonitorLevel;

    @Prop()
    probationStartDate?: Date;

    @Prop()
    probationEndDate?: Date;

    @Prop({ type: String, enum: Town })
    homeTown?: Town;

    @Prop({ trim: true })
    preferredLanguage?: string;
}

export const MonitorProfileSchema = SchemaFactory.createForClass(MonitorProfile);
MonitorProfileSchema.index({ userId: 1 }, { unique: true });
MonitorProfileSchema.index({ homeTown: 1 });
MonitorProfileSchema.index({ level: 1 });
