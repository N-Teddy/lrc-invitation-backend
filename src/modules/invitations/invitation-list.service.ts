import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Activity } from '../../entities/activity.entity';
import { Child } from '../../entities/child.entity';
import { Attendance } from '../../entities/attendance.entity';

export interface InvitedChild {
    id: number;
    fullName: string;
    dateOfBirth: string;
    currentGroup: string;
    isPrimary: boolean;
    isNearingAge: boolean;
    conferenceEligibility?: {
        participationCount: number;
        color: 'green' | 'yellow' | 'red';
        meetsRequirement: boolean;
    };
}

export interface InvitationList {
    activity: {
        id: number;
        name: string;
        date: string;
        type: string;
        allowedGroups: string[];
    };
    primaryInvitees: InvitedChild[];
    nearingAgeInvitees: InvitedChild[];
    statistics: {
        totalCount: number;
        primaryCount: number;
        nearingCount: number;
        eligibleCount?: number;
        partialCount?: number;
        insufficientCount?: number;
    };
    generatedAt: Date;
}

@Injectable()
export class InvitationListService {
    private readonly AGE_THRESHOLD_MONTHS = 3;
    private readonly CONFERENCE_REQUIREMENT = 3;

    constructor(
        @InjectRepository(Activity)
        private activityRepository: Repository<Activity>,
        @InjectRepository(Child)
        private childRepository: Repository<Child>,
        @InjectRepository(Attendance)
        private attendanceRepository: Repository<Attendance>,
    ) { }

    async generateInvitationList(activityId: number): Promise<InvitationList> {
        const activity = await this.activityRepository.findOne({
            where: { id: activityId },
        });

        if (!activity) {
            throw new NotFoundException(`Activity with ID ${activityId} not found`);
        }

        const allChildren = await this.childRepository.find({
            where: { active: true },
        });

        const primaryInvitees: InvitedChild[] = [];
        const nearingAgeInvitees: InvitedChild[] = [];

        for (const child of allChildren) {
            const isPrimary = this.isInPrimaryGroup(child, activity);
            const isNearing = this.isNearingNextGroup(
                child,
                activity.allowedGroups,
                this.AGE_THRESHOLD_MONTHS,
            );

            if (isPrimary || isNearing) {
                const invitedChild: InvitedChild = {
                    id: child.id,
                    fullName: child.name,
                    dateOfBirth: child.dateOfBirth.toString(),
                    currentGroup: child.currentGroup,
                    isPrimary,
                    isNearingAge: isNearing,
                };

                // Add conference eligibility if it's a conference
                if (activity.type === 'conference') {
                    const participationCount = await this.getServiceParticipationCount(
                        child.id,
                        new Date().getFullYear(),
                    );
                    invitedChild.conferenceEligibility = {
                        participationCount,
                        color: this.getEligibilityColor(
                            participationCount,
                            this.CONFERENCE_REQUIREMENT,
                        ),
                        meetsRequirement: participationCount >= this.CONFERENCE_REQUIREMENT,
                    };
                }

                if (isPrimary) {
                    primaryInvitees.push(invitedChild);
                } else {
                    nearingAgeInvitees.push(invitedChild);
                }
            }
        }

        const statistics = this.calculateStatistics(
            primaryInvitees,
            nearingAgeInvitees,
            activity.type === 'conference',
        );

        return {
            activity: {
                id: activity.id,
                name: activity.name,
                date: activity.date.toString(),
                type: activity.type,
                allowedGroups: activity.allowedGroups,
            },
            primaryInvitees,
            nearingAgeInvitees,
            statistics,
            generatedAt: new Date(),
        };
    }

    async generateUpcomingInvitations(): Promise<InvitationList[]> {
        const today = new Date();
        const startDate = new Date(today);
        startDate.setDate(today.getDate() + 14); // 2 weeks

        const endDate = new Date(today);
        endDate.setDate(today.getDate() + 21); // 3 weeks

        const upcomingActivities = await this.activityRepository.find({
            where: {
                date: Between(
                    startDate.toISOString().split('T')[0],
                    endDate.toISOString().split('T')[0],
                ) as any,
            },
        });

        const invitationLists: InvitationList[] = [];

        for (const activity of upcomingActivities) {
            const list = await this.generateInvitationList(activity.id);
            invitationLists.push(list);
        }

        return invitationLists;
    }

    private isInPrimaryGroup(child: Child, activity: Activity): boolean {
        return activity.allowedGroups.includes(child.currentGroup);
    }

    private isNearingNextGroup(
        child: Child,
        allowedGroups: string[],
        thresholdMonths: number,
    ): boolean {
        const ageInMonths = child.ageInMonths;

        const groupRanges: Record<string, { min: number; max: number }> = {
            'Pre-School': { min: 36, max: 71 },
            'Primary 1-3': { min: 72, max: 107 },
            'Primary 4-6': { min: 108, max: 143 },
            'Teens': { min: 144, max: 215 },
        };

        for (const group of allowedGroups) {
            const range = groupRanges[group];
            if (range) {
                const monthsUntilGroup = range.min - ageInMonths;
                if (monthsUntilGroup > 0 && monthsUntilGroup <= thresholdMonths) {
                    return true;
                }
            }
        }

        return false;
    }

    private async getServiceParticipationCount(
        childId: number,
        year: number,
    ): Promise<number> {
        const startDate = `${year}-01-01`;
        const endDate = `${year}-12-31`;

        const count = await this.attendanceRepository
            .createQueryBuilder('attendance')
            .leftJoin('attendance.activity', 'activity')
            .where('attendance.childId = :childId', { childId })
            .andWhere('attendance.present = :present', { present: true })
            .andWhere('activity.type = :type', { type: 'service' })
            .andWhere('activity.date BETWEEN :startDate AND :endDate', {
                startDate,
                endDate,
            })
            .getCount();

        return count;
    }

    private getEligibilityColor(
        participationCount: number,
        requirement: number,
    ): 'green' | 'yellow' | 'red' {
        if (participationCount >= requirement) {
            return 'green';
        } else if (participationCount >= requirement / 2) {
            return 'yellow';
        } else {
            return 'red';
        }
    }

    private calculateStatistics(
        primaryInvitees: InvitedChild[],
        nearingAgeInvitees: InvitedChild[],
        isConference: boolean,
    ) {
        const stats: any = {
            totalCount: primaryInvitees.length + nearingAgeInvitees.length,
            primaryCount: primaryInvitees.length,
            nearingCount: nearingAgeInvitees.length,
        };

        if (isConference) {
            const allInvitees = [...primaryInvitees, ...nearingAgeInvitees];
            stats.eligibleCount = allInvitees.filter(
                (c) => c.conferenceEligibility?.color === 'green',
            ).length;
            stats.partialCount = allInvitees.filter(
                (c) => c.conferenceEligibility?.color === 'yellow',
            ).length;
            stats.insufficientCount = allInvitees.filter(
                (c) => c.conferenceEligibility?.color === 'red',
            ).length;
        }

        return stats;
    }
}
