import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { AttendanceRoleAtTime, ClassificationLabel } from '../common/enums/attendance.enum';
import { ChildGroup, Town } from '../common/enums/activity.enum';

export type AttendanceDocument = HydratedDocument<Attendance>;

@Schema({ _id: false })
class AttendanceEntry {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    userId: Types.ObjectId;

    @Prop({ required: true })
    present: boolean;

    @Prop()
    donationFcfa?: number;

    @Prop({ type: String, enum: AttendanceRoleAtTime, required: true })
    roleAtTime: AttendanceRoleAtTime;

    @Prop({ type: String, enum: Town })
    originTownAtTime?: Town;

    @Prop({ type: String, enum: ChildGroup })
    groupAtTime?: ChildGroup;

    @Prop({ type: String, enum: ClassificationLabel })
    classificationLabel?: ClassificationLabel;
}

@Schema({ _id: false })
class ExternalAttendanceEntry {
    @Prop({ type: String, enum: ClassificationLabel, required: true })
    classificationLabel: ClassificationLabel;

    @Prop({ required: true })
    externalId: string;

    @Prop({ required: true, trim: true })
    fullName: string;

    @Prop()
    donationFcfa?: number;

    @Prop({ type: String, enum: Town })
    scopeTown?: Town;
}

@Schema({ timestamps: true })
export class Attendance {
    @Prop({ type: Types.ObjectId, ref: 'Activity', required: true, unique: true })
    activityId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'User' })
    takenByUserId?: Types.ObjectId;

    @Prop()
    takenAt?: Date;

    @Prop({ type: [AttendanceEntry], default: [] })
    entries: AttendanceEntry[];

    @Prop({ type: [ExternalAttendanceEntry], default: [] })
    externalEntries: ExternalAttendanceEntry[];
}

export const AttendanceSchema = SchemaFactory.createForClass(Attendance);
AttendanceSchema.index({ activityId: 1 }, { unique: true });
AttendanceSchema.index({ takenAt: 1 });
