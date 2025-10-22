import {
    Injectable,
    NotFoundException,
    ConflictException,
    BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Attendance } from '../../entities/attendance.entity';
import { Child } from '../../entities/child.entity';
import { Activity } from '../../entities/activity.entity';
import { Monitor } from '../../entities/monitor.entity';
import {
    CreateAttendanceDto,
    UpdateAttendanceDto,
    BulkAttendanceDto,
} from '../../dto/request/attendance.dto';

@Injectable()
export class AttendanceService {
    constructor(
        @InjectRepository(Attendance)
        private attendanceRepository: Repository<Attendance>,
        @InjectRepository(Child)
        private childRepository: Repository<Child>,
        @InjectRepository(Activity)
        private activityRepository: Repository<Activity>,
        @InjectRepository(Monitor)
        private monitorRepository: Repository<Monitor>,
    ) { }

    async create(createAttendanceDto: CreateAttendanceDto): Promise<Attendance> {
        // Verify child exists
        const child = await this.childRepository.findOne({
            where: { id: createAttendanceDto.childId },
        });
        if (!child) {
            throw new NotFoundException(
                `Child with ID ${createAttendanceDto.childId} not found`,
            );
        }

        // Verify activity exists
        const activity = await this.activityRepository.findOne({
            where: { id: createAttendanceDto.activityId },
        });
        if (!activity) {
            throw new NotFoundException(
                `Activity with ID ${createAttendanceDto.activityId} not found`,
            );
        }

        // Verify monitor exists
        const monitor = await this.monitorRepository.findOne({
            where: { id: createAttendanceDto.monitorId },
        });
        if (!monitor) {
            throw new NotFoundException(
                `Monitor with ID ${createAttendanceDto.monitorId} not found`,
            );
        }

        // Check if attendance record already exists
        const existingAttendance = await this.attendanceRepository.findOne({
            where: {
                childId: createAttendanceDto.childId,
                activityId: createAttendanceDto.activityId,
            },
        });

        if (existingAttendance) {
            throw new ConflictException(
                'Attendance record already exists for this child and activity',
            );
        }

        const attendance = this.attendanceRepository.create(createAttendanceDto);
        return this.attendanceRepository.save(attendance);
    }

    async createBulk(bulkAttendanceDto: BulkAttendanceDto): Promise<Attendance[]> {
        // Verify activity exists
        const activity = await this.activityRepository.findOne({
            where: { id: bulkAttendanceDto.activityId },
        });
        if (!activity) {
            throw new NotFoundException(
                `Activity with ID ${bulkAttendanceDto.activityId} not found`,
            );
        }

        // Verify monitor exists
        const monitor = await this.monitorRepository.findOne({
            where: { id: bulkAttendanceDto.monitorId },
        });
        if (!monitor) {
            throw new NotFoundException(
                `Monitor with ID ${bulkAttendanceDto.monitorId} not found`,
            );
        }

        // Verify all children exist
        const children = await this.childRepository.find({
            where: { id: In(bulkAttendanceDto.childIds) },
        });

        if (children.length !== bulkAttendanceDto.childIds.length) {
            throw new BadRequestException('Some children IDs are invalid');
        }

        // Check for existing attendance records
        const existingRecords = await this.attendanceRepository.find({
            where: {
                activityId: bulkAttendanceDto.activityId,
                childId: In(bulkAttendanceDto.childIds),
            },
        });

        if (existingRecords.length > 0) {
            const existingChildIds = existingRecords.map((r) => r.childId);
            throw new ConflictException(
                `Attendance records already exist for children: ${existingChildIds.join(', ')}`,
            );
        }

        // Create attendance records
        const attendanceRecords = bulkAttendanceDto.childIds.map((childId) =>
            this.attendanceRepository.create({
                childId,
                activityId: bulkAttendanceDto.activityId,
                monitorId: bulkAttendanceDto.monitorId,
                present: true,
            }),
        );

        return this.attendanceRepository.save(attendanceRecords);
    }

    async findAll(filters?: {
        childId?: number;
        activityId?: number;
        monitorId?: number;
        present?: boolean;
    }): Promise<Attendance[]> {
        const query = this.attendanceRepository
            .createQueryBuilder('attendance')
            .leftJoinAndSelect('attendance.child', 'child')
            .leftJoinAndSelect('attendance.activity', 'activity')
            .leftJoinAndSelect('attendance.monitor', 'monitor');

        if (filters?.childId) {
            query.andWhere('attendance.childId = :childId', {
                childId: filters.childId,
            });
        }

        if (filters?.activityId) {
            query.andWhere('attendance.activityId = :activityId', {
                activityId: filters.activityId,
            });
        }

        if (filters?.monitorId) {
            query.andWhere('attendance.monitorId = :monitorId', {
                monitorId: filters.monitorId,
            });
        }

        if (filters?.present !== undefined) {
            query.andWhere('attendance.present = :present', {
                present: filters.present,
            });
        }

        return query.orderBy('attendance.recordedAt', 'DESC').getMany();
    }

    async findOne(id: number): Promise<Attendance> {
        const attendance = await this.attendanceRepository.findOne({
            where: { id },
            relations: ['child', 'activity', 'monitor'],
        });

        if (!attendance) {
            throw new NotFoundException(`Attendance record with ID ${id} not found`);
        }

        return attendance;
    }

    async update(
        id: number,
        updateAttendanceDto: UpdateAttendanceDto,
    ): Promise<Attendance> {
        const attendance = await this.findOne(id);

        Object.assign(attendance, updateAttendanceDto);
        return this.attendanceRepository.save(attendance);
    }

    async remove(id: number): Promise<void> {
        const attendance = await this.findOne(id);
        await this.attendanceRepository.remove(attendance);
    }

    async getAttendanceByActivity(activityId: number): Promise<Attendance[]> {
        // Verify activity exists
        const activity = await this.activityRepository.findOne({
            where: { id: activityId },
        });
        if (!activity) {
            throw new NotFoundException(`Activity with ID ${activityId} not found`);
        }

        return this.attendanceRepository.find({
            where: { activityId },
            relations: ['child', 'monitor'],
            order: { recordedAt: 'DESC' },
        });
    }

    async getAttendanceByChild(childId: number): Promise<Attendance[]> {
        // Verify child exists
        const child = await this.childRepository.findOne({
            where: { id: childId },
        });
        if (!child) {
            throw new NotFoundException(`Child with ID ${childId} not found`);
        }

        return this.attendanceRepository.find({
            where: { childId },
            relations: ['activity', 'monitor'],
            order: { recordedAt: 'DESC' },
        });
    }

    async getAttendanceStatistics(filters?: {
        activityId?: number;
        childId?: number;
        startDate?: string;
        endDate?: string;
    }) {
        const query = this.attendanceRepository
            .createQueryBuilder('attendance')
            .leftJoin('attendance.activity', 'activity');

        if (filters?.activityId) {
            query.andWhere('attendance.activityId = :activityId', {
                activityId: filters.activityId,
            });
        }

        if (filters?.childId) {
            query.andWhere('attendance.childId = :childId', {
                childId: filters.childId,
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

        const total = await query.getCount();
        const present = await query
            .andWhere('attendance.present = :present', { present: true })
            .getCount();
        const absent = total - present;

        return {
            total,
            present,
            absent,
            attendanceRate: total > 0 ? ((present / total) * 100).toFixed(2) : 0,
        };
    }

    async getChildAttendanceRate(childId: number): Promise<any> {
        // Verify child exists
        const child = await this.childRepository.findOne({
            where: { id: childId },
        });
        if (!child) {
            throw new NotFoundException(`Child with ID ${childId} not found`);
        }

        const total = await this.attendanceRepository.count({
            where: { childId },
        });

        const present = await this.attendanceRepository.count({
            where: { childId, present: true },
        });

        return {
            childId,
            childName: child.name,
            totalActivities: total,
            presentCount: present,
            absentCount: total - present,
            attendanceRate: total > 0 ? ((present / total) * 100).toFixed(2) : 0,
        };
    }

    async getActivityAttendanceReport(activityId: number): Promise<any> {
        // Verify activity exists
        const activity = await this.activityRepository.findOne({
            where: { id: activityId },
        });
        if (!activity) {
            throw new NotFoundException(`Activity with ID ${activityId} not found`);
        }

        const attendanceRecords = await this.attendanceRepository.find({
            where: { activityId },
            relations: ['child'],
        });

        const total = attendanceRecords.length;
        const present = attendanceRecords.filter((r) => r.present).length;
        const absent = total - present;

        return {
            activity: {
                id: activity.id,
                name: activity.name,
                date: activity.date,
                type: activity.type,
            },
            statistics: {
                total,
                present,
                absent,
                attendanceRate: total > 0 ? ((present / total) * 100).toFixed(2) : 0,
            },
            records: attendanceRecords.map((record) => ({
                id: record.id,
                child: {
                    id: record.child.id,
                    name: record.child.name,
                },
                present: record.present,
                notes: record.notes,
                recordedAt: record.recordedAt,
            })),
        };
    }
}
