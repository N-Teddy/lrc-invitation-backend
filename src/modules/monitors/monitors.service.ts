import {
    Injectable,
    NotFoundException,
    ConflictException,
    BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Monitor } from '../../entities/monitor.entity';
import {
    CreateMonitorDto,
    UpdateMonitorDto,
    UpdateMonitorPasswordDto,
} from '../../dto/request/monitors.dto';
import { Role } from '../../common/enums/role.enum';

@Injectable()
export class MonitorsService {
    constructor(
        @InjectRepository(Monitor)
        private monitorsRepository: Repository<Monitor>,
    ) { }

    async create(createMonitorDto: CreateMonitorDto): Promise<Monitor> {
        // Check if email already exists
        const existingMonitor = await this.monitorsRepository.findOne({
            where: { email: createMonitorDto.email },
        });

        if (existingMonitor) {
            throw new ConflictException('Email already exists');
        }

        // Hash password
        const passwordHash = await bcrypt.hash(createMonitorDto.password, 10);

        const monitor = this.monitorsRepository.create({
            ...createMonitorDto,
            passwordHash,
        });

        return this.monitorsRepository.save(monitor);
    }

    async findAll(filters?: {
        role?: Role;
        assignedTown?: string;
        yearlyFeePaid?: boolean;
    }): Promise<Monitor[]> {
        const query = this.monitorsRepository.createQueryBuilder('monitor');

        if (filters?.role) {
            query.andWhere('monitor.role = :role', { role: filters.role });
        }

        if (filters?.assignedTown) {
            query.andWhere('monitor.assignedTown = :assignedTown', {
                assignedTown: filters.assignedTown,
            });
        }

        if (filters?.yearlyFeePaid !== undefined) {
            query.andWhere('monitor.yearlyFeePaid = :yearlyFeePaid', {
                yearlyFeePaid: filters.yearlyFeePaid,
            });
        }

        return query.getMany();
    }

    async findOne(id: number): Promise<Monitor> {
        const monitor = await this.monitorsRepository.findOne({
            where: { id },
            relations: ['activities'],
        });

        if (!monitor) {
            throw new NotFoundException(`Monitor with ID ${id} not found`);
        }

        return monitor;
    }

    async findByEmail(email: string): Promise<Monitor | null> {
        return this.monitorsRepository.findOne({ where: { email } });
    }

    async update(id: number, updateMonitorDto: UpdateMonitorDto): Promise<Monitor> {
        const monitor = await this.findOne(id);

        // If email is being updated, check if it's already taken
        if (updateMonitorDto.email && updateMonitorDto.email !== monitor.email) {
            const existingMonitor = await this.monitorsRepository.findOne({
                where: { email: updateMonitorDto.email },
            });

            if (existingMonitor) {
                throw new ConflictException('Email already exists');
            }
        }

        Object.assign(monitor, updateMonitorDto);
        return this.monitorsRepository.save(monitor);
    }

    async updatePassword(
        id: number,
        updatePasswordDto: UpdateMonitorPasswordDto,
    ): Promise<void> {
        const monitor = await this.findOne(id);

        // Verify current password
        const isPasswordValid = await bcrypt.compare(
            updatePasswordDto.currentPassword,
            monitor.passwordHash,
        );

        if (!isPasswordValid) {
            throw new BadRequestException('Current password is incorrect');
        }

        // Hash new password
        const newPasswordHash = await bcrypt.hash(updatePasswordDto.newPassword, 10);

        monitor.passwordHash = newPasswordHash;
        await this.monitorsRepository.save(monitor);
    }

    async updateYearlyFeeStatus(
        id: number,
        paid: boolean,
        amount?: number,
    ): Promise<Monitor> {
        const monitor = await this.findOne(id);

        monitor.yearlyFeePaid = paid;
        if (amount !== undefined) {
            monitor.yearlyFeeAmount = amount;
        }

        return this.monitorsRepository.save(monitor);
    }

    async remove(id: number): Promise<void> {
        const monitor = await this.findOne(id);
        await this.monitorsRepository.remove(monitor);
    }

    async getStatistics() {
        const total = await this.monitorsRepository.count();
        const byRole = await this.monitorsRepository
            .createQueryBuilder('monitor')
            .select('monitor.role', 'role')
            .addSelect('COUNT(*)', 'count')
            .groupBy('monitor.role')
            .getRawMany();

        const byTown = await this.monitorsRepository
            .createQueryBuilder('monitor')
            .select('monitor.assignedTown', 'town')
            .addSelect('COUNT(*)', 'count')
            .groupBy('monitor.assignedTown')
            .getRawMany();

        const feePaid = await this.monitorsRepository.count({
            where: { yearlyFeePaid: true },
        });

        const feeUnpaid = total - feePaid;

        return {
            total,
            byRole,
            byTown,
            yearlyFee: {
                paid: feePaid,
                unpaid: feeUnpaid,
            },
        };
    }
}
