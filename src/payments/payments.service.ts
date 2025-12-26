import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { NotificationContextType } from '../common/enums/notification.enum';
import { LifecycleStatus, MonitorLevel, UserRole } from '../common/enums/user.enum';
import { Town } from '../common/enums/activity.enum';
import { YEARLY_CONTRIBUTION_FCFA } from '../common/constants/payments.constants';
import { CreatePaymentDto, PaymentsQueryDto, UpdatePaymentDto } from '../dtos/request/payment.dto';
import { Payment, PaymentDocument } from '../schema/payment.schema';
import { User, UserDocument } from '../schema/user.schema';
import { NotificationService } from '../notifications/notifications.service';
import { AppConfigService } from '../config/app-config.service';
import { TownScopeService } from '../common/services/town-scope.service';

interface MonitorYearState {
    totalPaid: number;
    carryFromPrevious: number;
    effectivePaid: number;
    carryForward: number;
}

@Injectable()
export class PaymentsService {
    constructor(
        @InjectModel(Payment.name) private readonly paymentModel: Model<PaymentDocument>,
        @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
        private readonly notificationService: NotificationService,
        private readonly config: AppConfigService,
        private readonly townScopeService: TownScopeService,
    ) {}

    async create(dto: CreatePaymentDto, currentUser: Record<string, any>) {
        this.ensureMonitor(currentUser, dto.monitorUserId);
        const town = await this.resolveTownOrFail(currentUser);

        const monitor = await this.userModel.findById(dto.monitorUserId).lean().exec();
        if (!monitor) throw new NotFoundException('Monitor not found');
        if (monitor.role !== UserRole.Monitor)
            throw new BadRequestException('User is not a monitor');
        if (((monitor.originTown as Town | undefined) ?? Town.Yaounde) !== town) {
            throw new ForbiddenException('Not allowed to record contributions for other towns');
        }

        const paidAt = new Date(dto.paidAt);
        if (Number.isNaN(paidAt.getTime())) throw new BadRequestException('Invalid paidAt');

        const recordedByUserId = currentUser?._id ?? currentUser?.id;

        const created = await new this.paymentModel({
            monitorUserId: new Types.ObjectId(dto.monitorUserId),
            year: dto.year,
            town,
            amountFcfa: dto.amountFcfa,
            paidAt,
            recordedByUserId: recordedByUserId
                ? new Types.ObjectId(String(recordedByUserId))
                : undefined,
        }).save();

        await this.notifyTownSuperMonitors(monitor, created, currentUser);
        return created.toObject();
    }

    async findAll(query: PaymentsQueryDto, currentUser: Record<string, any>) {
        this.assertSuper(currentUser);
        const town = await this.resolveTownOrFail(currentUser);

        const filter: Record<string, any> = {};
        if (query.monitorUserId) filter.monitorUserId = new Types.ObjectId(query.monitorUserId);
        if (query.year) filter.year = query.year;
        filter.town = town;

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

        const town = await this.resolveTownOrFail(currentUser);
        const user = await this.userModel.findById(monitorUserId).lean().exec();
        if (!user) throw new NotFoundException('Monitor not found');
        if (user.role !== UserRole.Monitor) throw new BadRequestException('User is not a monitor');
        if (!isSelf) {
            const userTown = (user.originTown as Town | undefined) ?? Town.Yaounde;
            if (userTown !== town) {
                throw new ForbiddenException('Not allowed to view other towns');
            }
        }

        const totals = await this.aggregateMonitorTotals(monitorUserId, year);
        const state = this.computeYearState(year, totals);

        return {
            monitorUserId,
            year,
            expectedFcfa: YEARLY_CONTRIBUTION_FCFA,
            totalPaidFcfa: state.totalPaid,
            carryFromPreviousYearFcfa: state.carryFromPrevious,
            effectivePaidFcfa: state.effectivePaid,
            carriedForwardFcfa: state.carryForward,
            balanceFcfa: YEARLY_CONTRIBUTION_FCFA - state.effectivePaid,
        };
    }

    async yearlyOverview(year: number, currentUser: Record<string, any>) {
        this.assertSuper(currentUser);
        const town = await this.resolveTownOrFail(currentUser);

        const monitors = await this.userModel
            .find({ role: UserRole.Monitor, originTown: town })
            .select({ _id: 1, originTown: 1 })
            .lean()
            .exec();

        const totalsByMonitor = await this.aggregateTotalsByMonitor(year);

        const byTownMap = new Map<Town, any>();
        let totalEffectivePaid = 0;
        let unpaidCount = 0;
        let underpaidCount = 0;
        let exactCount = 0;
        let overpaidCount = 0;

        for (const monitor of monitors) {
            const monitorId = String(monitor._id);
            const map = totalsByMonitor.get(monitorId);
            const state = this.computeYearState(year, map ?? new Map());
            const effective = state.effectivePaid;
            totalEffectivePaid += effective;

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
            t.totalPaidFcfa += effective;

            if (effective <= 0) {
                unpaidCount += 1;
                t.unpaidCount += 1;
            } else if (effective < YEARLY_CONTRIBUTION_FCFA) {
                underpaidCount += 1;
                t.underpaidCount += 1;
            } else if (effective === YEARLY_CONTRIBUTION_FCFA) {
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
            totalPaidFcfa: totalEffectivePaid,
            balanceTotalFcfa: expectedTotalFcfa - totalEffectivePaid,
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
        const town = await this.resolveTownOrFail(currentUser);

        const existing = await this.paymentModel.findById(id).lean().exec();
        if (!existing) throw new NotFoundException('Payment not found');
        if (((existing as any).town as Town | undefined) !== town) {
            throw new ForbiddenException('Not allowed to edit other towns');
        }

        const update: Record<string, any> = {};
        if (dto.monitorUserId) {
            const monitor = await this.userModel.findById(dto.monitorUserId).lean().exec();
            if (!monitor) throw new NotFoundException('Monitor not found');
            if (monitor.role !== UserRole.Monitor)
                throw new BadRequestException('User is not a monitor');
            if (((monitor.originTown as Town | undefined) ?? Town.Yaounde) !== town) {
                throw new ForbiddenException('Not allowed to record contributions for other towns');
            }
            update.monitorUserId = new Types.ObjectId(dto.monitorUserId);
            update.town = town;
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
        const town = await this.resolveTownOrFail(currentUser);

        const payment = await this.paymentModel.findById(id).lean().exec();
        if (!payment) throw new NotFoundException('Payment not found');
        if (((payment as any).town as Town | undefined) !== town) {
            throw new ForbiddenException('Not allowed to delete other towns');
        }

        await this.paymentModel.findByIdAndDelete(id).exec();
        return { deleted: true };
    }

    private isSuper(user: Record<string, any>) {
        return user?.role === UserRole.Monitor && user?.monitorLevel === MonitorLevel.Super;
    }

    private async resolveTownOrFail(currentUser: Record<string, any>): Promise<Town> {
        const town = await this.townScopeService.resolveMonitorTown(currentUser);
        if (!town) throw new ForbiddenException('Monitor town not set');
        return town;
    }

    private assertSuper(user: Record<string, any>) {
        if (!this.isSuper(user)) {
            throw new ForbiddenException('Super Monitor only');
        }
    }

    private ensureMonitor(currentUser: Record<string, any>, monitorUserId: string) {
        if (currentUser?.role !== UserRole.Monitor) {
            throw new ForbiddenException('Only monitors can record contributions');
        }

        if (this.isSuper(currentUser)) return;

        const currentUserId = String(currentUser?.id ?? currentUser?._id);
        if (currentUserId !== monitorUserId) {
            throw new ForbiddenException('Monitors may only log their own contributions');
        }
    }

    private async aggregateMonitorTotals(monitorUserId: string, uptoYear: number) {
        const rows = await this.paymentModel
            .aggregate([
                {
                    $match: {
                        monitorUserId: new Types.ObjectId(monitorUserId),
                        year: { $lte: uptoYear },
                    },
                },
                {
                    $group: {
                        _id: '$year',
                        totalPaidFcfa: { $sum: '$amountFcfa' },
                    },
                },
            ])
            .exec();
        const totals = new Map<number, number>();
        for (const row of rows) {
            totals.set(Number(row._id), row.totalPaidFcfa ?? 0);
        }
        return totals;
    }

    private computeYearState(year: number, totals: Map<number, number>) {
        const candidateYears = [...totals.keys(), year];
        const startYear = candidateYears.length ? Math.min(...candidateYears) : year;
        let carryFromPrevious = 0;
        let state: MonitorYearState = {
            totalPaid: totals.get(year) ?? 0,
            carryFromPrevious: 0,
            effectivePaid: 0,
            carryForward: 0,
        };
        for (let y = startYear; y <= year; y++) {
            const total = totals.get(y) ?? 0;
            const prevCarry = carryFromPrevious;
            const effective = total + prevCarry;
            const nextCarry = Math.max(effective - YEARLY_CONTRIBUTION_FCFA, 0);
            if (y === year) {
                state = {
                    totalPaid: total,
                    carryFromPrevious: prevCarry,
                    effectivePaid: effective,
                    carryForward: nextCarry,
                };
            }
            carryFromPrevious = nextCarry;
        }
        return state;
    }

    private async aggregateTotalsByMonitor(year: number) {
        const rows = await this.paymentModel
            .aggregate([
                {
                    $match: {
                        year: { $lte: year },
                    },
                },
                {
                    $group: {
                        _id: { monitorUserId: '$monitorUserId', year: '$year' },
                        totalPaidFcfa: { $sum: '$amountFcfa' },
                    },
                },
            ])
            .exec();

        const map = new Map<string, Map<number, number>>();
        for (const row of rows) {
            const monitorId = String(row._id.monitorUserId);
            const totals = map.get(monitorId) ?? new Map<number, number>();
            totals.set(Number(row._id.year), row.totalPaidFcfa ?? 0);
            map.set(monitorId, totals);
        }
        return map;
    }

    private async notifyTownSuperMonitors(
        monitor: User,
        payment: PaymentDocument,
        currentUser: Record<string, any>,
    ) {
        const town = (monitor.originTown as Town) ?? Town.Yaounde;
        const supers = await this.userModel
            .find({
                role: UserRole.Monitor,
                monitorLevel: MonitorLevel.Super,
                lifecycleStatus: LifecycleStatus.Active,
                originTown: town,
            })
            .lean()
            .exec();

        if (!supers.length) return;

        const recordedByName = currentUser?.fullName ?? currentUser?.name ?? 'System';
        const primaryChannel = this.config.notificationProvider;
        await Promise.all(
            supers.map(async (superMonitor) => {
                const to =
                    primaryChannel === 'whatsapp'
                        ? superMonitor.whatsApp?.phoneE164
                        : superMonitor.email;
                if (!to) {
                    return;
                }

                await this.notificationService.send({
                    userId: String(superMonitor._id),
                    to,
                    contextType: NotificationContextType.Payment,
                    contextId: String(payment._id),
                    subject: 'New contribution recorded',
                    message: `${monitor.fullName} recorded ${payment.amountFcfa} FCFA for ${payment.year}.`,
                    templateName: 'payment-recorded',
                    templateData: {
                        monitorName: monitor.fullName,
                        amountFcfa: payment.amountFcfa,
                        year: payment.year,
                        town,
                        paidAt: payment.paidAt.toISOString(),
                        recordedBy: recordedByName,
                    },
                });
            }),
        );
    }
}
