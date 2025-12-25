"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const payment_schema_1 = require("../schema/payment.schema");
const user_schema_1 = require("../schema/user.schema");
const payments_constants_1 = require("../common/constants/payments.constants");
const user_enum_1 = require("../common/enums/user.enum");
const activity_enum_1 = require("../common/enums/activity.enum");
let PaymentsService = class PaymentsService {
    constructor(paymentModel, userModel) {
        this.paymentModel = paymentModel;
        this.userModel = userModel;
    }
    async create(dto, currentUser) {
        this.assertSuper(currentUser);
        const monitor = await this.userModel.findById(dto.monitorUserId).lean().exec();
        if (!monitor)
            throw new common_1.NotFoundException('Monitor not found');
        if (monitor.role !== user_enum_1.UserRole.Monitor)
            throw new common_1.BadRequestException('User is not a monitor');
        const paidAt = new Date(dto.paidAt);
        if (Number.isNaN(paidAt.getTime()))
            throw new common_1.BadRequestException('Invalid paidAt');
        const recordedByUserId = currentUser?._id ?? currentUser?.id;
        const created = await new this.paymentModel({
            monitorUserId: new mongoose_2.Types.ObjectId(dto.monitorUserId),
            year: dto.year,
            amountFcfa: dto.amountFcfa,
            paidAt,
            recordedByUserId: recordedByUserId
                ? new mongoose_2.Types.ObjectId(String(recordedByUserId))
                : undefined,
        }).save();
        return created.toObject();
    }
    async findAll(query, currentUser) {
        this.assertSuper(currentUser);
        const filter = {};
        if (query.monitorUserId)
            filter.monitorUserId = new mongoose_2.Types.ObjectId(query.monitorUserId);
        if (query.year)
            filter.year = query.year;
        return this.paymentModel.find(filter).sort({ paidAt: -1 }).lean().exec();
    }
    async findMine(year, currentUser) {
        const monitorUserId = currentUser?.id ?? currentUser?._id;
        if (!monitorUserId)
            throw new common_1.ForbiddenException('Missing user');
        if (currentUser?.role !== user_enum_1.UserRole.Monitor)
            throw new common_1.ForbiddenException('Only monitors');
        const filter = {
            monitorUserId: new mongoose_2.Types.ObjectId(String(monitorUserId)),
        };
        if (year)
            filter.year = year;
        const items = await this.paymentModel.find(filter).sort({ paidAt: -1 }).lean().exec();
        const summary = await this.getSummary(String(monitorUserId), year ?? new Date().getFullYear(), currentUser, {
            allowSelf: true,
        });
        return { items, summary };
    }
    async getSummary(monitorUserId, year, currentUser, opts) {
        const isSelf = String(currentUser?.id ?? currentUser?._id) === monitorUserId;
        if (!this.isSuper(currentUser) && !(opts?.allowSelf && isSelf)) {
            throw new common_1.ForbiddenException('Not allowed');
        }
        const user = await this.userModel.findById(monitorUserId).lean().exec();
        if (!user)
            throw new common_1.NotFoundException('Monitor not found');
        if (user.role !== user_enum_1.UserRole.Monitor)
            throw new common_1.BadRequestException('User is not a monitor');
        const agg = await this.paymentModel
            .aggregate([
            {
                $match: {
                    monitorUserId: new mongoose_2.Types.ObjectId(monitorUserId),
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
            expectedFcfa: payments_constants_1.YEARLY_CONTRIBUTION_FCFA,
            totalPaidFcfa,
            balanceFcfa: payments_constants_1.YEARLY_CONTRIBUTION_FCFA - totalPaidFcfa,
        };
    }
    async yearlyOverview(year, currentUser) {
        this.assertSuper(currentUser);
        const monitors = await this.userModel
            .find({ role: user_enum_1.UserRole.Monitor })
            .select({ _id: 1, originTown: 1 })
            .lean()
            .exec();
        const totals = await this.paymentModel
            .aggregate([
            { $match: { year } },
            { $group: { _id: '$monitorUserId', totalPaidFcfa: { $sum: '$amountFcfa' } } },
        ])
            .exec();
        const totalByMonitorId = new Map();
        for (const row of totals) {
            totalByMonitorId.set(String(row._id), row.totalPaidFcfa ?? 0);
        }
        const byTownMap = new Map();
        let totalPaidFcfa = 0;
        let unpaidCount = 0;
        let underpaidCount = 0;
        let exactCount = 0;
        let overpaidCount = 0;
        for (const monitor of monitors) {
            const monitorId = String(monitor._id);
            const paid = totalByMonitorId.get(monitorId) ?? 0;
            totalPaidFcfa += paid;
            const town = monitor.originTown ?? activity_enum_1.Town.Yaounde;
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
            }
            else if (paid < payments_constants_1.YEARLY_CONTRIBUTION_FCFA) {
                underpaidCount += 1;
                t.underpaidCount += 1;
            }
            else if (paid === payments_constants_1.YEARLY_CONTRIBUTION_FCFA) {
                exactCount += 1;
                t.exactCount += 1;
            }
            else {
                overpaidCount += 1;
                t.overpaidCount += 1;
            }
        }
        const monitorsCount = monitors.length;
        const expectedTotalFcfa = monitorsCount * payments_constants_1.YEARLY_CONTRIBUTION_FCFA;
        return {
            year,
            expectedPerMonitorFcfa: payments_constants_1.YEARLY_CONTRIBUTION_FCFA,
            monitorsCount,
            expectedTotalFcfa,
            totalPaidFcfa,
            balanceTotalFcfa: expectedTotalFcfa - totalPaidFcfa,
            unpaidCount,
            underpaidCount,
            exactCount,
            overpaidCount,
            byTown: [...byTownMap.values()].sort((a, b) => String(a.town).localeCompare(String(b.town))),
        };
    }
    async update(id, dto, currentUser) {
        this.assertSuper(currentUser);
        const update = {};
        if (dto.monitorUserId) {
            const monitor = await this.userModel.findById(dto.monitorUserId).lean().exec();
            if (!monitor)
                throw new common_1.NotFoundException('Monitor not found');
            if (monitor.role !== user_enum_1.UserRole.Monitor)
                throw new common_1.BadRequestException('User is not a monitor');
            update.monitorUserId = new mongoose_2.Types.ObjectId(dto.monitorUserId);
        }
        if (dto.year !== undefined)
            update.year = dto.year;
        if (dto.amountFcfa !== undefined)
            update.amountFcfa = dto.amountFcfa;
        if (dto.paidAt !== undefined) {
            const paidAt = new Date(dto.paidAt);
            if (Number.isNaN(paidAt.getTime()))
                throw new common_1.BadRequestException('Invalid paidAt');
            update.paidAt = paidAt;
        }
        const updated = await this.paymentModel
            .findByIdAndUpdate(id, { $set: update }, { new: true })
            .lean()
            .exec();
        if (!updated)
            throw new common_1.NotFoundException('Payment not found');
        return updated;
    }
    async remove(id, currentUser) {
        this.assertSuper(currentUser);
        const deleted = await this.paymentModel.findByIdAndDelete(id).lean().exec();
        if (!deleted)
            throw new common_1.NotFoundException('Payment not found');
        return { deleted: true };
    }
    isSuper(user) {
        return user?.role === user_enum_1.UserRole.Monitor && user?.monitorLevel === user_enum_1.MonitorLevel.Super;
    }
    assertSuper(user) {
        if (!this.isSuper(user)) {
            throw new common_1.ForbiddenException('Super Monitor only');
        }
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(payment_schema_1.Payment.name)),
    __param(1, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map