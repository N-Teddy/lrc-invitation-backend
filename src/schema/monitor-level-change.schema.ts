import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { MonitorLevel } from '../common/enums/user.enum';

export type MonitorLevelChangeDocument = HydratedDocument<MonitorLevelChange>;

@Schema({ timestamps: true })
export class MonitorLevelChange {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    userId: Types.ObjectId;

    @Prop({ type: String, enum: MonitorLevel })
    oldLevel?: MonitorLevel;

    @Prop({ type: String, enum: MonitorLevel, required: true })
    newLevel: MonitorLevel;

    @Prop({ type: Types.ObjectId, ref: 'User' })
    changedByUserId?: Types.ObjectId;
}

export const MonitorLevelChangeSchema = SchemaFactory.createForClass(MonitorLevelChange);
MonitorLevelChangeSchema.index({ createdAt: -1 });
MonitorLevelChangeSchema.index({ userId: 1, createdAt: -1 });
