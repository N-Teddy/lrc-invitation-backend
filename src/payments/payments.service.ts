import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Payment, PaymentDocument } from '../schema/payment.schema';
import { User, UserDocument } from '../schema/user.schema';
import { YEARLY_CONTRIBUTION_FCFA } from '../common/constants/payments.constants';
import { CreatePaymentDto, PaymentsQueryDto, UpdatePaymentDto } from '../dtos/request/payment.dto';
import { MonitorLevel, UserRole } from '../common/enums/user.enum';
import { Town } from '../common/enums/activity.enum';

@Injectable()
export class PaymentsService {
    constructor(
        @InjectModel(Payment.name) private readonly paymentModel: Model<PaymentDocument>,
        @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    ) {}

    async create(dto: CreatePaymentDto, currentUser: Record<string, any>) {
        this.assertSuper(currentUser);

        const monitor = await this.userModel.findById(dto.monitorUserId).lean().exec();
        if (!monitor) throw new NotFoundException('Monitor not found');
        if (monitor.role !== UserRole.Monitor)
            throw new BadRequestException('User is not a monitor');

        const paidAt = new Date(dto.paidAt);
        if (Number.isNaN(paidAt.getTime())) throw new BadRequestException('Invalid paidAt');

        const recordedByUserId = currentUser?._id ?? currentUser?.id;

        const created = await new this.paymentModel({
            monitorUserId: new Types.ObjectId(dto.monitorUserId),
            year: dto.year,
            amountFcfa: dto.amountFcfa,
            paidAt,
            recordedByUserId: recordedByUserId
                ? new Types.ObjectId(String(recordedByUserId))
                : undefined,
        }).save();

        return created.toObject();
    }

    async findAll(query: PaymentsQueryDto, currentUser: Record<string, any>) {
        this.assertSuper(currentUser);

        const filter: Record<string, any> = {};
        if (query.monitorUserId) filter.monitorUserId = new Types.ObjectId(query.monitorUserId);
        if (query.year) filter.year = query.year;

        return this.paymentModel.find(filter).sort({ paidAt: -1 }).lean().exec();
    }

    async findMine(year: number | undefined, currentUser: Record<string, any>) {
        const monitorUserId = currentUser?.id ?? currentUser?._id;
        if (!monitorUserId) throw new ForbiddenException('Missing user');
        if (currentUser?.role !== UserRole.Monitor) throw new ForbiddenException('Only monitors');

        const filter: Record<string, any> = {
            monitorUserId: new Types.ObjectId(String(monitorUserId)),
        };
        if (year) filter.year = year;

        const items = await this.paymentModel.find(filter).sort({ paidAt: -1 }).lean().exec();
        const summary = await this.getSummary(
            String(monitorUserId),
            year ?? new Date().getFullYear(),
            currentUser,
            {
                allowSelf: true,
            },
        );
        return { items, summary };
    }

    async getSummary(
        monitorUserId: string,
        year: number,
        currentUser: Record<string, any>,
        opts?: { allowSelf?: boolean },
    ) {
        const isSelf = String(currentUser?.id ?? currentUser?._id) === monitorUserId;
        if (!this.isSuper(currentUser) && !(opts?.allowSelf && isSelf)) {
            throw new ForbiddenException('Not allowed');
        }

        const user = await this.userModel.findById(monitorUserId).lean().exec();
        if (!user) throw new NotFoundException('Monitor not found');
        if (user.role !== UserRole.Monitor) throw new BadRequestException('User is not a monitor');

        const agg = await this.paymentModel
            .aggregate([
                {
                    $match: {
                        monitorUserId: new Types.ObjectId(monitorUserId),
                        year,
                    },
                },
                {
                    $group: {
                        _id: null,
                        totalPaidFcfa: { $sum: '$amountFcfa' },
                    },
                },
            ])
            .exec();

        const totalPaidFcfa = agg?.[0]?.totalPaidFcfa ?? 0;
        return {
            monitorUserId,
            year,
            expectedFcfa: YEARLY_CONTRIBUTION_FCFA,
            totalPaidFcfa,
            balanceFcfa: YEARLY_CONTRIBUTION_FCFA - totalPaidFcfa,
        };
    }

    async yearlyOverview(year: number, currentUser: Record<string, any>) {
        this.assertSuper(currentUser);

        const monitors = await this.userModel
            .find({ role: UserRole.Monitor })
            .select({ _id: 1, originTown: 1 })
            .lean()
            .exec();

        const totals = await this.paymentModel
            .aggregate([
                { $match: { year } },
                { $group: { _id: '$monitorUserId', totalPaidFcfa: { $sum: '$amountFcfa' } } },
            ])
            .exec();

        const totalByMonitorId = new Map<string, number>();
        for (const row of totals) {
            totalByMonitorId.set(String(row._id), row.totalPaidFcfa ?? 0);
        }

        const byTownMap = new Map<Town, any>();
        let totalPaidFcfa = 0;
        let unpaidCount = 0;
        let underpaidCount = 0;
        let exactCount = 0;
        let overpaidCount = 0;

        for (const monitor of monitors) {
            const monitorId = String(monitor._id);
            const paid = totalByMonitorId.get(monitorId) ?? 0;
            totalPaidFcfa += paid;

            const town = (monitor.originTown as Town | undefined) ?? Town.Yaounde;
            if (!byTownMap.has(town)) {
                byTownMap.set(town, {
                    town,
                    monitorsCount: 0,
                    totalPaidFcfa: 0,
                    unpaidCount: 0,
                    underpaidCount: 0,
                    exactCount: 0,
                    overpaidCount: 0,
                });
            }
            const t = byTownMap.get(town);
            t.monitorsCount += 1;
            t.totalPaidFcfa += paid;

            if (paid <= 0) {
                unpaidCount += 1;
                t.unpaidCount += 1;
            } else if (paid < YEARLY_CONTRIBUTION_FCFA) {
                underpaidCount += 1;
                t.underpaidCount += 1;
            } else if (paid === YEARLY_CONTRIBUTION_FCFA) {
                exactCount += 1;
                t.exactCount += 1;
            } else {
                overpaidCount += 1;
                t.overpaidCount += 1;
            }
        }

        const monitorsCount = monitors.length;
        const expectedTotalFcfa = monitorsCount * YEARLY_CONTRIBUTION_FCFA;

        return {
            year,
            expectedPerMonitorFcfa: YEARLY_CONTRIBUTION_FCFA,
            monitorsCount,
            expectedTotalFcfa,
            totalPaidFcfa,
            balanceTotalFcfa: expectedTotalFcfa - totalPaidFcfa,
            unpaidCount,
            underpaidCount,
            exactCount,
            overpaidCount,
            byTown: [...byTownMap.values()].sort((a, b) =>
                String(a.town).localeCompare(String(b.town)),
            ),
        };
    }

    async update(id: string, dto: UpdatePaymentDto, currentUser: Record<string, any>) {
        this.assertSuper(currentUser);

        const update: Record<string, any> = {};
        if (dto.monitorUserId) {
            const monitor = await this.userModel.findById(dto.monitorUserId).lean().exec();
            if (!monitor) throw new NotFoundException('Monitor not found');
            if (monitor.role !== UserRole.Monitor)
                throw new BadRequestException('User is not a monitor');
            update.monitorUserId = new Types.ObjectId(dto.monitorUserId);
        }
        if (dto.year !== undefined) update.year = dto.year;
        if (dto.amountFcfa !== undefined) update.amountFcfa = dto.amountFcfa;
        if (dto.paidAt !== undefined) {
            const paidAt = new Date(dto.paidAt);
            if (Number.isNaN(paidAt.getTime())) throw new BadRequestException('Invalid paidAt');
            update.paidAt = paidAt;
        }

        const updated = await this.paymentModel
            .findByIdAndUpdate(id, { $set: update }, { new: true })
            .lean()
            .exec();
        if (!updated) throw new NotFoundException('Payment not found');
        return updated;
    }

    async remove(id: string, currentUser: Record<string, any>) {
        this.assertSuper(currentUser);
        const deleted = await this.paymentModel.findByIdAndDelete(id).lean().exec();
        if (!deleted) throw new NotFoundException('Payment not found');
        return { deleted: true };
    }

    private isSuper(user: Record<string, any>) {
        return user?.role === UserRole.Monitor && user?.monitorLevel === MonitorLevel.Super;
    }

    private assertSuper(user: Record<string, any>) {
        if (!this.isSuper(user)) {
            throw new ForbiddenException('Super Monitor only');
        }
    }
}
