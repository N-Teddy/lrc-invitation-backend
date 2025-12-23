import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type PaymentDocument = HydratedDocument<Payment>;

@Schema({ timestamps: true })
export class Payment {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    monitorUserId: Types.ObjectId;

    @Prop({ required: true })
    year: number;

    @Prop({ required: true })
    amountFcfa: number;

    @Prop({ required: true })
    paidAt: Date;

    @Prop({ type: Types.ObjectId, ref: 'User' })
    recordedByUserId?: Types.ObjectId;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
PaymentSchema.index({ monitorUserId: 1, year: 1 });
PaymentSchema.index({ paidAt: 1 });
