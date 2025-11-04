import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MonitorContribution } from '../../entities/monitor-contribution.entity';
import { Monitor } from '../../entities/monitor.entity';
import { RecordPaymentRequest } from '../../request/contribution.request';
import { BusinessException } from '../../common/exceptions/business.exception';
import { PaymentStatus } from '../../common/enums/payment-status.enum';
import { ConfigurationService } from '../configuration/configuration.service';

@Injectable()
export class ContributionService {
	constructor(
		@InjectRepository(MonitorContribution)
		private contributionRepository: Repository<MonitorContribution>,
		@InjectRepository(Monitor)
		private monitorRepository: Repository<Monitor>,
		private configurationService: ConfigurationService
	) {}

	async getMonitorContributions(
		monitorId: string,
		year?: number
	): Promise<MonitorContribution[]> {
		const monitor = await this.monitorRepository.findOne({
			where: { id: monitorId },
		});

		if (!monitor) {
			throw new BusinessException('Monitor not found');
		}

		const query: any = { monitorId };
		if (year) {
			query.year = year;
		}

		return this.contributionRepository.find({
			where: query,
			order: { year: 'DESC' },
		});
	}

	async recordPayment(
		monitorId: string,
		year: number,
		paymentRequest: RecordPaymentRequest
	): Promise<MonitorContribution> {
		const monitor = await this.monitorRepository.findOne({
			where: { id: monitorId },
		});

		if (!monitor) {
			throw new BusinessException('Monitor not found');
		}

		let contribution = await this.contributionRepository.findOne({
			where: { monitorId, year },
		});

		const annualAmount = await this.configurationService.getAnnualMonitorContribution();

		if (!contribution) {
			contribution = this.contributionRepository.create({
				monitorId,
				year,
				amountDue: annualAmount,
				amountPaid: 0,
				installments: [],
			});
		}

		// Add installment
		const installments = contribution.installments || [];
		installments.push({
			amount: paymentRequest.amount,
			date: new Date(paymentRequest.paymentDate),
			notes: paymentRequest.notes,
		});

		contribution.installments = installments;
		contribution.amountPaid = installments.reduce((sum, inst) => sum + inst.amount, 0);

		// Update payment status
		if (contribution.amountPaid >= contribution.amountDue) {
			contribution.paymentStatus = PaymentStatus.COMPLETED;
		} else if (contribution.amountPaid > 0) {
			contribution.paymentStatus = PaymentStatus.PARTIAL;
		} else {
			contribution.paymentStatus = PaymentStatus.PENDING;
		}

		return this.contributionRepository.save(contribution);
	}

	async getAllContributions(year?: number): Promise<MonitorContribution[]> {
		const query: any = {};
		if (year) {
			query.year = year;
		}

		return this.contributionRepository.find({
			where: query,
			relations: ['monitor'],
			order: { year: 'DESC', createdAt: 'DESC' },
		});
	}

	async initializeYearlyContributions(year: number): Promise<void> {
		const monitors = await this.monitorRepository.find({
			where: { isActive: true },
		});

		const annualAmount = await this.configurationService.getAnnualMonitorContribution();

		for (const monitor of monitors) {
			const existing = await this.contributionRepository.findOne({
				where: { monitorId: monitor.id, year },
			});

			if (!existing) {
				const contribution = this.contributionRepository.create({
					monitorId: monitor.id,
					year,
					amountDue: annualAmount,
					amountPaid: 0,
					paymentStatus: PaymentStatus.PENDING,
					installments: [],
				});

				await this.contributionRepository.save(contribution);
			}
		}
	}

	async getContributionSummary(year: number): Promise<any> {
		const contributions = await this.getAllContributions(year);

		const summary = {
			year,
			totalMonitors: contributions.length,
			totalAmountDue: contributions.reduce((sum, c) => sum + Number(c.amountDue), 0),
			totalAmountPaid: contributions.reduce((sum, c) => sum + Number(c.amountPaid), 0),
			completed: contributions.filter((c) => c.paymentStatus === PaymentStatus.COMPLETED)
				.length,
			partial: contributions.filter((c) => c.paymentStatus === PaymentStatus.PARTIAL).length,
			pending: contributions.filter((c) => c.paymentStatus === PaymentStatus.PENDING).length,
		};

		return summary;
	}
}
