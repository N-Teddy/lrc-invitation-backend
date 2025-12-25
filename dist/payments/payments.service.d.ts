import { Model, Types } from 'mongoose';
import { Payment, PaymentDocument } from '../schema/payment.schema';
import { UserDocument } from '../schema/user.schema';
import { CreatePaymentDto, PaymentsQueryDto, UpdatePaymentDto } from '../dtos/request/payment.dto';
export declare class PaymentsService {
    private readonly paymentModel;
    private readonly userModel;
    constructor(paymentModel: Model<PaymentDocument>, userModel: Model<UserDocument>);
    create(dto: CreatePaymentDto, currentUser: Record<string, any>): Promise<import("mongoose").Document<unknown, {}, Payment> & Payment & {
        _id: Types.ObjectId;
    } & Required<{
        _id: Types.ObjectId;
    }>>;
    findAll(query: PaymentsQueryDto, currentUser: Record<string, any>): Promise<(import("mongoose").FlattenMaps<import("mongoose").Document<unknown, {}, Payment> & Payment & {
        _id: Types.ObjectId;
    }> & Required<{
        _id: Types.ObjectId;
    }>)[]>;
    findMine(year: number | undefined, currentUser: Record<string, any>): Promise<{
        items: (import("mongoose").FlattenMaps<import("mongoose").Document<unknown, {}, Payment> & Payment & {
            _id: Types.ObjectId;
        }> & Required<{
            _id: Types.ObjectId;
        }>)[];
        summary: {
            monitorUserId: string;
            year: number;
            expectedFcfa: number;
            totalPaidFcfa: any;
            balanceFcfa: number;
        };
    }>;
    getSummary(monitorUserId: string, year: number, currentUser: Record<string, any>, opts?: {
        allowSelf?: boolean;
    }): Promise<{
        monitorUserId: string;
        year: number;
        expectedFcfa: number;
        totalPaidFcfa: any;
        balanceFcfa: number;
    }>;
    yearlyOverview(year: number, currentUser: Record<string, any>): Promise<{
        year: number;
        expectedPerMonitorFcfa: number;
        monitorsCount: number;
        expectedTotalFcfa: number;
        totalPaidFcfa: number;
        balanceTotalFcfa: number;
        unpaidCount: number;
        underpaidCount: number;
        exactCount: number;
        overpaidCount: number;
        byTown: any[];
    }>;
    update(id: string, dto: UpdatePaymentDto, currentUser: Record<string, any>): Promise<import("mongoose").FlattenMaps<import("mongoose").Document<unknown, {}, Payment> & Payment & {
        _id: Types.ObjectId;
    }> & Required<{
        _id: Types.ObjectId;
    }>>;
    remove(id: string, currentUser: Record<string, any>): Promise<{
        deleted: boolean;
    }>;
    private isSuper;
    private assertSuper;
}
