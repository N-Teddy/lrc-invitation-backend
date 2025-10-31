import {
    Injectable,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { Activity } from '../../entities/activity.entity';
import { Monitor } from '../../entities/monitor.entity';
import {
    CreateActivityDto,
    UpdateActivityDto,
} from '../../dto/request/activities.dto';
import { ActivityType } from '../../common/enums/activity-type.enum';
import { Region } from '../../common/enums/region.enum';
import { AgeGroup } from '../../common/enums/age-group.enum';

@Injectable()
export class ActivitiesService {
    constructor(
        @InjectRepository(Activity)
        private activitiesRepository: Repository<Activity>,
        @InjectRepository(Monitor)
        private monitorsRepository: Repository<Monitor>,
    ) { }

    async create(createActivityDto: CreateActivityDto): Promise<Activity> {
        // Verify monitor exists
        const monitor = await this.monitorsRepository.findOne({
            where: { id: createActivityDto.monitorId },
        });

        if (!monitor) {
            throw new NotFoundException(
                `Monitor with ID ${createActivityDto.monitorId} not found`,
            );
        }

        // Validate date is not in the past
        const activityDate = new Date(createActivityDto.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (activityDate < today) {
            throw new BadRequestException('Activity date cannot be in the past');
        }

        const activity = this.activitiesRepository.create(createActivityDto);
        return this.activitiesRepository.save(activity);
    }

    async findAll(filters?: {
        type?: ActivityType;
        region?: Region;
        targetAgeGroup?: AgeGroup;
        monitorId?: number;
        startDate?: string;
        endDate?: string;
    }): Promise<Activity[]> {
        const query = this.activitiesRepository.createQueryBuilder('activity');

        if (filters?.type) {
            query.andWhere('activity.type = :type', { type: filters.type });
        }

        if (filters?.region) {
            query.andWhere('activity.region = :region', { region: filters.region });
        }

        if (filters?.targetAgeGroup) {
            query.andWhere('activity.targetAgeGroup = :targetAgeGroup', {
                targetAgeGroup: filters.targetAgeGroup,
            });
        }

        if (filters?.monitorId) {
            query.andWhere('activity.monitorId = :monitorId', {
                monitorId: filters.monitorId,
            });
        }

        if (filters?.startDate) {
            query.andWhere('activity.date >= :startDate', {
                startDate: filters.startDate,
            });
        }

        if (filters?.endDate) {
            query.andWhere('activity.date <= :endDate', {
                endDate: filters.endDate,
            });
        }

        return query
            .orderBy('activity.date', 'DESC')
            .addOrderBy('activity.time', 'ASC')
            .getMany();
    }

    async findOne(id: number): Promise<Activity> {
        const activity = await this.activitiesRepository.findOne({
            where: { id },
            relations: ['attendanceRecords', 'invitations'],
        });

        if (!activity) {
            throw new NotFoundException(`Activity with ID ${id} not found`);
        }

        return activity;
    }

    async update(
        id: number,
        updateActivityDto: UpdateActivityDto,
    ): Promise<Activity> {
        const activity = await this.findOne(id);

        // If updating monitor, verify new monitor exists
        if (updateActivityDto.monitorId) {
            const monitor = await this.monitorsRepository.findOne({
                where: { id: updateActivityDto.monitorId },
            });

            if (!monitor) {
                throw new NotFoundException(
                    `Monitor with ID ${updateActivityDto.monitorId} not found`,
                );
            }
        }

        // Validate date is not in the past if updating
        if (updateActivityDto.date) {
            const activityDate = new Date(updateActivityDto.date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (activityDate < today) {
                throw new BadRequestException('Activity date cannot be in the past');
            }
        }

        Object.assign(activity, updateActivityDto);
        return this.activitiesRepository.save(activity);
    }

    async remove(id: number): Promise<void> {
        const activity = await this.findOne(id);
        await this.activitiesRepository.remove(activity);
    }

    async getStatistics(filters?: {
        startDate?: string;
        endDate?: string;
        region?: Region;
    }) {
        const query = this.activitiesRepository.createQueryBuilder('activity');

        if (filters?.startDate) {
            query.andWhere('activity.date >= :startDate', {
                startDate: filters.startDate,
            });
        }

        if (filters?.endDate) {
            query.andWhere('activity.date <= :endDate', {
                endDate: filters.endDate,
            });
        }

        if (filters?.region) {
            query.andWhere('activity.region = :region', { region: filters.region });
        }

        const total = await query.getCount();

        const byType = await this.activitiesRepository
            .createQueryBuilder('activity')
            .select('activity.type', 'type')
            .addSelect('COUNT(*)', 'count')
            .groupBy('activity.type')
            .getRawMany();

        const byRegion = await this.activitiesRepository
            .createQueryBuilder('activity')
            .select('activity.region', 'region')
            .addSelect('COUNT(*)', 'count')
            .groupBy('activity.region')
            .getRawMany();

        const byAgeGroup = await this.activitiesRepository
            .createQueryBuilder('activity')
            .select('activity.targetAgeGroup', 'ageGroup')
            .addSelect('COUNT(*)', 'count')
            .where('activity.targetAgeGroup IS NOT NULL')
            .groupBy('activity.targetAgeGroup')
            .getRawMany();

        return {
            total,
            byType,
            byRegion,
            byAgeGroup,
        };
    }

    async findUpcoming(region?: Region, ageGroup?: AgeGroup): Promise<Activity[]> {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const query = this.activitiesRepository
            .createQueryBuilder('activity')
            .where('activity.date >= :today', { today });

        if (region) {
            query.andWhere('activity.region = :region', { region });
        }

        if (ageGroup) {
            query.andWhere('activity.targetAgeGroup = :ageGroup', { ageGroup });
        }

        return query
            .orderBy('activity.date', 'ASC')
            .addOrderBy('activity.time', 'ASC')
            .getMany();
    }

    async findByDateRange(startDate: string, endDate: string): Promise<Activity[]> {
        return this.activitiesRepository.find({
            where: {
                date: Between(new Date(startDate), new Date(endDate)),
            },
            order: { date: 'ASC', time: 'ASC' },
        });
    }
}
