import { HydratedDocument, Types } from 'mongoose';
export type PaymentDocument = HydratedDocument<Payment>;
export declare class Payment {
    monitorUserId: Types.ObjectId;
    year: number;
    amountFcfa: number;
    paidAt: Date;
    recordedByUserId?: Types.ObjectId;
}
export declare const PaymentSchema: import("mongoose").Schema<Payment, import("mongoose").Model<Payment, any, any, any, import("mongoose").Document<unknown, any, Payment> & Payment & {
    _id: Types.ObjectId;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Payment, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<Payment>> & import("mongoose").FlatRecord<Payment> & {
    _id: Types.ObjectId;
}>;
