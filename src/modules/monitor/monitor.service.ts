import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Monitor } from '../../entities/monitor.entity';
import { CreateMonitorRequest, UpdateMonitorRequest } from '../../request/monitor.request';
import { MonitorResponse } from '../../response/monitor.response';
import { BusinessException } from '../../common/exceptions/business.exception';
import { Role } from '../../common/enums/role.enum';

@Injectable()
export class MonitorService {
	constructor(
		@InjectRepository(Monitor)
		private monitorRepository: Repository<Monitor>
	) {}

	async create(createRequest: CreateMonitorRequest): Promise<MonitorResponse> {
		const existingMonitor = await this.monitorRepository.findOne({
			where: { email: createRequest.email },
		});

		if (existingMonitor) {
			throw new BusinessException('Monitor with this email already exists');
		}

		const hashedPassword = await bcrypt.hash(createRequest.password, 10);

		const monitor = this.monitorRepository.create({
			...createRequest,
			password: hashedPassword,
			role: createRequest.role || Role.MONITOR,
		});

		const savedMonitor = await this.monitorRepository.save(monitor);
		return this.toResponse(savedMonitor);
	}

	async findAll(townId?: string): Promise<MonitorResponse[]> {
		const query = this.monitorRepository
			.createQueryBuilder('monitor')
			.leftJoinAndSelect('monitor.town', 'town');

		if (townId) {
			query.where('monitor.townId = :townId', { townId });
		}

		const monitors = await query.getMany();
		return monitors.map((monitor) => this.toResponse(monitor));
	}

	async findOne(id: string): Promise<MonitorResponse> {
		const monitor = await this.monitorRepository.findOne({
			where: { id },
			relations: ['town'],
		});

		if (!monitor) {
			throw new BusinessException('Monitor not found');
		}

		return this.toResponse(monitor);
	}

	async update(id: string, updateRequest: UpdateMonitorRequest): Promise<MonitorResponse> {
		const monitor = await this.monitorRepository.findOne({ where: { id } });

		if (!monitor) {
			throw new BusinessException('Monitor not found');
		}

		if (updateRequest.email && updateRequest.email !== monitor.email) {
			const existingMonitor = await this.monitorRepository.findOne({
				where: { email: updateRequest.email },
			});

			if (existingMonitor) {
				throw new BusinessException('Monitor with this email already exists');
			}
		}

		Object.assign(monitor, updateRequest);
		const updatedMonitor = await this.monitorRepository.save(monitor);

		return this.findOne(updatedMonitor.id);
	}

	async remove(id: string): Promise<void> {
		const monitor = await this.monitorRepository.findOne({ where: { id } });

		if (!monitor) {
			throw new BusinessException('Monitor not found');
		}

		await this.monitorRepository.update(id, { isActive: false });
	}

	private toResponse(monitor: Monitor): MonitorResponse {
		return {
			id: monitor.id,
			firstName: monitor.firstName,
			lastName: monitor.lastName,
			email: monitor.email,
			phone: monitor.phone,
			whatsappNumber: monitor.whatsappNumber,
			role: monitor.role,
			townId: monitor.townId,
			townName: monitor.town?.name,
			isActive: monitor.isActive,
			createdAt: monitor.createdAt,
			updatedAt: monitor.updatedAt,
		};
	}
}
