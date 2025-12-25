import { CreatePaymentDto, PaymentsQueryDto, UpdatePaymentDto } from '../dtos/request/payment.dto';
import { PaymentsService } from './payments.service';
export declare class PaymentsController {
    private readonly paymentsService;
    constructor(paymentsService: PaymentsService);
    create(dto: CreatePaymentDto, currentUser: any): Promise<import("mongoose").Document<unknown, {}, import("../schema/payment.schema").Payment> & import("../schema/payment.schema").Payment & {
        _id: import("mongoose").Types.ObjectId;
    } & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>>;
    findAll(query: PaymentsQueryDto, currentUser: any): Promise<{
        items: (import("mongoose").FlattenMaps<import("mongoose").Document<unknown, {}, import("../schema/payment.schema").Payment> & import("../schema/payment.schema").Payment & {
            _id: import("mongoose").Types.ObjectId;
        }> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }>)[];
    }>;
    myPayments(currentUser: any, year?: string): Promise<{
        items: (import("mongoose").FlattenMaps<import("mongoose").Document<unknown, {}, import("../schema/payment.schema").Payment> & import("../schema/payment.schema").Payment & {
            _id: import("mongoose").Types.ObjectId;
        }> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }>)[];
        summary: {
            monitorUserId: string;
            year: number;
            expectedFcfa: number;
            totalPaidFcfa: any;
            balanceFcfa: number;
        };
    }>;
    summary(monitorUserId: string, year: string, currentUser: any): Promise<{
        monitorUserId: string;
        year: number;
        expectedFcfa: number;
        totalPaidFcfa: any;
        balanceFcfa: number;
    }>;
    yearlyOverview(year: string, currentUser: any): Promise<{
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
    update(id: string, dto: UpdatePaymentDto, currentUser: any): Promise<import("mongoose").FlattenMaps<import("mongoose").Document<unknown, {}, import("../schema/payment.schema").Payment> & import("../schema/payment.schema").Payment & {
        _id: import("mongoose").Types.ObjectId;
    }> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>>;
    remove(id: string, currentUser: any): Promise<{
        deleted: boolean;
    }>;
}
