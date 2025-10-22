import {
    Injectable,
    NotFoundException,
    ConflictException,
    BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, LessThan } from 'typeorm';
import { Invitation } from '../../entities/invitation.entity';
import { Child } from '../../entities/child.entity';
import { Activity } from '../../entities/activity.entity';
import {
    CreateInvitationDto,
    UpdateInvitationDto,
    BulkInvitationDto,
    RespondToInvitationDto,
} from '../../dto/request/invitations.dto';
import { InvitationStatus } from '../../common/enums/invitation-status.enum';
import { randomBytes } from 'crypto';

@Injectable()
export class InvitationsService {
    constructor(
        @InjectRepository(Invitation)
        private invitationsRepository: Repository<Invitation>,
        @InjectRepository(Child)
        private childRepository: Repository<Child>,
        @InjectRepository(Activity)
        private activityRepository: Repository<Activity>,
    ) { }

    private generateInvitationCode(): string {
        return randomBytes(16).toString('hex').toUpperCase();
    }

    async create(createInvitationDto: CreateInvitationDto): Promise<Invitation> {
        // Verify child exists
        const child = await this.childRepository.findOne({
            where: { id: createInvitationDto.childId },
        });
        if (!child) {
            throw new NotFoundException(
                `Child with ID ${createInvitationDto.childId} not found`,
            );
        }

        // Verify activity exists
        const activity = await this.activityRepository.findOne({
            where: { id: createInvitationDto.activityId },
        });
        if (!activity) {
            throw new NotFoundException(
                `Activity with ID ${createInvitationDto.activityId} not found`,
            );
        }

        // Check if activity date is in the future
        const activityDate = new Date(activity.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (activityDate < today) {
            throw new BadRequestException(
                'Cannot create invitation for past activities',
            );
        }

        // Check if invitation already exists
        const existingInvitation = await this.invitationsRepository.findOne({
            where: {
                childId: createInvitationDto.childId,
                activityId: createInvitationDto.activityId,
            },
        });

        if (existingInvitation) {
            throw new ConflictException(
                'Invitation already exists for this child and activity',
            );
        }

        const invitation = this.invitationsRepository.create({
            ...createInvitationDto,
            invitationCode: this.generateInvitationCode(),
            status: InvitationStatus.PENDING,
        });

        return this.invitationsRepository.save(invitation);
    }

    async createBulk(bulkInvitationDto: BulkInvitationDto): Promise<Invitation[]> {
        // Verify activity exists
        const activity = await this.activityRepository.findOne({
            where: { id: bulkInvitationDto.activityId },
        });
        if (!activity) {
            throw new NotFoundException(
                `Activity with ID ${bulkInvitationDto.activityId} not found`,
            );
        }

        // Check if activity date is in the future
        const activityDate = new Date(activity.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (activityDate < today) {
            throw new BadRequestException(
                'Cannot create invitations for past activities',
            );
        }

        // Verify all children exist
        const children = await this.childRepository.find({
            where: { id: In(bulkInvitationDto.childIds) },
        });

        if (children.length !== bulkInvitationDto.childIds.length) {
            throw new BadRequestException('Some children IDs are invalid');
        }

        // Check for existing invitations
        const existingInvitations = await this.invitationsRepository.find({
            where: {
                activityId: bulkInvitationDto.activityId,
                childId: In(bulkInvitationDto.childIds),
            },
        });

        if (existingInvitations.length > 0) {
            const existingChildIds = existingInvitations.map((i) => i.childId);
            throw new ConflictException(
                `Invitations already exist for children: ${existingChildIds.join(', ')}`,
            );
        }

        // Create invitations
        const invitations = bulkInvitationDto.childIds.map((childId) =>
            this.invitationsRepository.create({
                childId,
                activityId: bulkInvitationDto.activityId,
                invitationCode: this.generateInvitationCode(),
                status: InvitationStatus.PENDING,
            }),
        );

        return this.invitationsRepository.save(invitations);
    }

    async findAll(filters?: {
        childId?: number;
        activityId?: number;
        status?: InvitationStatus;
    }): Promise<Invitation[]> {
        const query = this.invitationsRepository
            .createQueryBuilder('invitation')
            .leftJoinAndSelect('invitation.child', 'child')
            .leftJoinAndSelect('invitation.activity', 'activity');

        if (filters?.childId) {
            query.andWhere('invitation.childId = :childId', {
                childId: filters.childId,
            });
        }

        if (filters?.activityId) {
            query.andWhere('invitation.activityId = :activityId', {
                activityId: filters.activityId,
            });
        }

        if (filters?.status) {
            query.andWhere('invitation.status = :status', {
                status: filters.status,
            });
        }

        return query.orderBy('invitation.createdAt', 'DESC').getMany();
    }

    async findOne(id: number): Promise<Invitation> {
        const invitation = await this.invitationsRepository.findOne({
            where: { id },
            relations: ['child', 'activity'],
        });

        if (!invitation) {
            throw new NotFoundException(`Invitation with ID ${id} not found`);
        }

        return invitation;
    }

    async findByCode(invitationCode: string): Promise<Invitation> {
        const invitation = await this.invitationsRepository.findOne({
            where: { invitationCode },
            relations: ['child', 'activity'],
        });

        if (!invitation) {
            throw new NotFoundException(
                `Invitation with code ${invitationCode} not found`,
            );
        }

        return invitation;
    }

    async update(
        id: number,
        updateInvitationDto: UpdateInvitationDto,
    ): Promise<Invitation> {
        const invitation = await this.findOne(id);

        Object.assign(invitation, updateInvitationDto);
        return this.invitationsRepository.save(invitation);
    }

    async markAsSent(id: number): Promise<Invitation> {
        const invitation = await this.findOne(id);

        if (invitation.status !== InvitationStatus.PENDING) {
            throw new BadRequestException(
                'Only pending invitations can be marked as sent',
            );
        }

        invitation.status = InvitationStatus.SENT;
        invitation.sentAt = new Date();

        return this.invitationsRepository.save(invitation);
    }

    async markBulkAsSent(activityId: number): Promise<Invitation[]> {
        const invitations = await this.invitationsRepository.find({
            where: {
                activityId,
                status: InvitationStatus.PENDING,
            },
        });

        if (invitations.length === 0) {
            throw new NotFoundException(
                'No pending invitations found for this activity',
            );
        }

        const now = new Date();
        invitations.forEach((invitation) => {
            invitation.status = InvitationStatus.SENT;
            invitation.sentAt = now;
        });

        return this.invitationsRepository.save(invitations);
    }

    async respondToInvitation(
        invitationCode: string,
        respondDto: RespondToInvitationDto,
    ): Promise<Invitation> {
        const invitation = await this.findByCode(invitationCode);

        if (invitation.status !== InvitationStatus.SENT) {
            throw new BadRequestException(
                'Only sent invitations can be responded to',
            );
        }

        // Check if activity is still in the future
        const activity = invitation.activity;
        const activityDate = new Date(activity.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (activityDate < today) {
            invitation.status = InvitationStatus.EXPIRED;
            await this.invitationsRepository.save(invitation);
            throw new BadRequestException('This invitation has expired');
        }

        invitation.status = respondDto.accept
            ? InvitationStatus.ACCEPTED
            : InvitationStatus.DECLINED;
        invitation.respondedAt = new Date();

        return this.invitationsRepository.save(invitation);
    }

    async remove(id: number): Promise<void> {
        const invitation = await this.findOne(id);
        await this.invitationsRepository.remove(invitation);
    }

    async getInvitationsByActivity(activityId: number): Promise<Invitation[]> {
        const activity = await this.activityRepository.findOne({
            where: { id: activityId },
        });
        if (!activity) {
            throw new NotFoundException(`Activity with ID ${activityId} not found`);
        }

        return this.invitationsRepository.find({
            where: { activityId },
            relations: ['child'],
            order: { createdAt: 'DESC' },
        });
    }

    async getInvitationsByChild(childId: number): Promise<Invitation[]> {
        const child = await this.childRepository.findOne({
            where: { id: childId },
        });
        if (!child) {
            throw new NotFoundException(`Child with ID ${childId} not found`);
        }

        return this.invitationsRepository.find({
            where: { childId },
            relations: ['activity'],
            order: { createdAt: 'DESC' },
        });
    }

    async getInvitationStatistics(activityId?: number) {
        const query = this.invitationsRepository.createQueryBuilder('invitation');

        if (activityId) {
            query.where('invitation.activityId = :activityId', { activityId });
        }

        const total = await query.getCount();
        const pending = await query
            .clone()
            .andWhere('invitation.status = :status', {
                status: InvitationStatus.PENDING,
            })
            .getCount();
        const sent = await query
            .clone()
            .andWhere('invitation.status = :status', {
                status: InvitationStatus.SENT,
            })
            .getCount();
        const accepted = await query
            .clone()
            .andWhere('invitation.status = :status', {
                status: InvitationStatus.ACCEPTED,
            })
            .getCount();
        const declined = await query
            .clone()
            .andWhere('invitation.status = :status', {
                status: InvitationStatus.DECLINED,
            })
            .getCount();
        const expired = await query
            .clone()
            .andWhere('invitation.status = :status', {
                status: InvitationStatus.EXPIRED,
            })
            .getCount();

        return {
            total,
            pending,
            sent,
            accepted,
            declined,
            expired,
            responseRate:
                sent > 0 ? (((accepted + declined) / sent) * 100).toFixed(2) : 0,
            acceptanceRate: sent > 0 ? ((accepted / sent) * 100).toFixed(2) : 0,
        };
    }

    async expireOldInvitations(): Promise<number> {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Find all sent invitations for activities that have passed
        const expiredInvitations = await this.invitationsRepository
            .createQueryBuilder('invitation')
            .leftJoin('invitation.activity', 'activity')
            .where('invitation.status IN (:...statuses)', {
                statuses: [InvitationStatus.PENDING, InvitationStatus.SENT],
            })
            .andWhere('activity.date < :today', { today })
            .getMany();

        if (expiredInvitations.length === 0) {
            return 0;
        }

        expiredInvitations.forEach((invitation) => {
            invitation.status = InvitationStatus.EXPIRED;
        });

        await this.invitationsRepository.save(expiredInvitations);
        return expiredInvitations.length;
    }
}
