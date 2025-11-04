import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Participant } from '../../entities/participant.entity';
import { Child } from '../../entities/child.entity';
import { Activity } from '../../entities/activity.entity';
import { Attendance } from '../../entities/attendance.entity';
import { AgeGroup } from '../../entities/age-group.entity';
import { ParticipantResponse, ParticipantListResponse } from '../../response/participant.response';
import { BusinessException } from '../../common/exceptions/business.exception';
import { EligibilityResult } from '../../common/interfaces/eligibility-result.interface';
import { ParticipationReason } from '../../common/enums/participation-reason.enum';
import { ActivityType } from '../../common/enums/activity-type.enum';
import { ConfigurationService } from '../configuration/configuration.service';

@Injectable()
export class ParticipationService {
	constructor(
		@InjectRepository(Participant)
		private participantRepository: Repository<Participant>,
		@InjectRepository(Child)
		private childRepository: Repository<Child>,
		@InjectRepository(Activity)
		private activityRepository: Repository<Activity>,
		@InjectRepository(Attendance)
		private attendanceRepository: Repository<Attendance>,
		@InjectRepository(AgeGroup)
		private ageGroupRepository: Repository<AgeGroup>,
		private configurationService: ConfigurationService
	) {}

	async generateParticipantList(activityId: string): Promise<ParticipantListResponse> {
		const activity = await this.activityRepository.findOne({
			where: { id: activityId },
			relations: ['targetGroups', 'targetGroups.ageGroup', 'town'],
		});

		if (!activity) {
			throw new BusinessException('Activity not found');
		}

		if (activity.participantListGenerated) {
			throw new BusinessException('Participant list already generated for this activity');
		}

		const targetGroupIds = activity.targetGroups.map((tg) => tg.ageGroupId);

		// Get all children from the activity's town
		const children = await this.childRepository.find({
			where: {
				townId: activity.townId,
				isActive: true,
			},
			relations: ['currentAgeGroup', 'town'],
		});

		const participants: Participant[] = [];

		for (const child of children) {
			const eligibility = await this.checkEligibility(child, activity, targetGroupIds);

			if (eligibility.eligible) {
				const participant = this.participantRepository.create({
					activityId: activity.id,
					childId: child.id,
					meetsRequirements: eligibility.meetsRequirements,
					reasonForInclusion: eligibility.reason,
					notes: eligibility.details,
				});

				participants.push(participant);
			}
		}

		await this.participantRepository.save(participants);

		return this.getParticipantList(activityId);
	}

	async getParticipantList(activityId: string): Promise<ParticipantListResponse> {
		const activity = await this.activityRepository.findOne({
			where: { id: activityId },
			relations: ['town'],
		});

		if (!activity) {
			throw new BusinessException('Activity not found');
		}

		const participants = await this.participantRepository.find({
			where: { activityId },
			relations: ['child', 'child.currentAgeGroup', 'child.town'],
		});

		// Get attendance records
		const attendanceRecords = await this.attendanceRepository.find({
			where: { activityId },
		});

		const attendanceMap = new Map(attendanceRecords.map((a) => [a.childId, a]));

		const participantResponses: ParticipantResponse[] = participants.map((p) => {
			const attendance = attendanceMap.get(p.childId);
			return this.toParticipantResponse(p, attendance);
		});

		return {
			activityId: activity.id,
			activityTitle: activity.title,
			activityDate: activity.startDate,
			activityLocation: activity.location,
			participants: participantResponses,
			totalParticipants: participantResponses.length,
			meetingRequirements: participantResponses.filter((p) => p.meetsRequirements).length,
			conditional: participantResponses.filter((p) => !p.meetsRequirements).length,
			generatedAt: activity.participantListGeneratedAt || new Date(),
		};
	}

	private async checkEligibility(
		child: Child,
		activity: Activity,
		targetGroupIds: string[]
	): Promise<EligibilityResult> {
		const childAge = this.calculateAge(child.dateOfBirth);
		const agePromotionThreshold = await this.configurationService.getAgePromotionThreshold();

		// Check if child's group is in target groups
		if (targetGroupIds.includes(child.currentAgeGroupId)) {
			// Check conference prerequisites
			if (activity.activityType === ActivityType.CONFERENCE) {
				const meetsPrerequisites = await this.checkConferencePrerequisites(
					child.id,
					targetGroupIds
				);

				if (!meetsPrerequisites) {
					return {
						eligible: true,
						reason: ParticipationReason.CONDITIONAL,
						meetsRequirements: false,
						details: 'Does not meet conference attendance prerequisites',
					};
				}
			}

			return {
				eligible: true,
				reason: ParticipationReason.NORMAL,
				meetsRequirements: true,
			};
		}

		// Check if child can participate in lower group activities (higher groups can join lower)
		const allAgeGroups = await this.ageGroupRepository.find({
			order: { minAge: 'ASC' },
		});

		const childGroupIndex = allAgeGroups.findIndex((g) => g.id === child.currentAgeGroupId);
		const targetGroupIndices = targetGroupIds.map((id) =>
			allAgeGroups.findIndex((g) => g.id === id)
		);

		const canParticipateInLower = targetGroupIndices.some((idx) => idx < childGroupIndex);

		if (canParticipateInLower) {
			return {
				eligible: true,
				reason: ParticipationReason.NORMAL,
				meetsRequirements: true,
				details: 'Participating in lower age group activity',
			};
		}

		// Check age promotion eligibility
		const monthsUntilNextBirthday = this.getMonthsUntilNextAgeGroup(
			child.dateOfBirth,
			allAgeGroups,
			childGroupIndex
		);

		if (monthsUntilNextBirthday <= agePromotionThreshold) {
			const nextGroupIndex = childGroupIndex + 1;
			if (nextGroupIndex < allAgeGroups.length) {
				const nextGroupId = allAgeGroups[nextGroupIndex].id;

				if (targetGroupIds.includes(nextGroupId)) {
					// For conferences, still need to check prerequisites
					if (activity.activityType === ActivityType.CONFERENCE) {
						const meetsPrerequisites = await this.checkConferencePrerequisites(
							child.id,
							[nextGroupId]
						);

						if (!meetsPrerequisites) {
							return {
								eligible: true,
								reason: ParticipationReason.AGE_PROMOTION,
								meetsRequirements: false,
								details: `Age promotion eligible (${monthsUntilNextBirthday} months until next group) but does not meet conference prerequisites`,
							};
						}
					}

					return {
						eligible: true,
						reason: ParticipationReason.AGE_PROMOTION,
						meetsRequirements: true,
						details: `Age promotion - ${monthsUntilNextBirthday} months until next age group`,
					};
				}
			}
		}

		return {
			eligible: false,
			reason: ParticipationReason.NORMAL,
			meetsRequirements: false,
			details: 'Not eligible for this activity',
		};
	}

	private async checkConferencePrerequisites(
		childId: string,
		targetGroupIds: string[]
	): Promise<boolean> {
		const requiredServices =
			await this.configurationService.getConferencePrerequisiteServices();
		const currentYear = new Date().getFullYear();

		// Get all service activities for the target groups in the current year
		const serviceActivities = await this.activityRepository
			.createQueryBuilder('activity')
			.innerJoin('activity.targetGroups', 'targetGroup')
			.where('activity.activityType = :type', { type: ActivityType.SERVICE })
			.andWhere('targetGroup.ageGroupId IN (:...groupIds)', { groupIds: targetGroupIds })
			.andWhere('EXTRACT(YEAR FROM activity.startDate) = :year', { year: currentYear })
			.andWhere('activity.startDate < :now', { now: new Date() })
			.getMany();

		if (serviceActivities.length === 0) {
			return false;
		}

		const activityIds = serviceActivities.map((a) => a.id);

		// Count how many services the child attended
		const attendanceCount = await this.attendanceRepository.count({
			where: {
				childId,
				activityId: In(activityIds),
				wasPresent: true,
			},
		});

		return attendanceCount >= requiredServices;
	}

	private calculateAge(dateOfBirth: Date): number {
		const today = new Date();
		let age = today.getFullYear() - dateOfBirth.getFullYear();
		const monthDiff = today.getMonth() - dateOfBirth.getMonth();

		if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())) {
			age--;
		}

		return age;
	}

	private getMonthsUntilNextAgeGroup(
		dateOfBirth: Date,
		ageGroups: AgeGroup[],
		currentGroupIndex: number
	): number {
		if (currentGroupIndex >= ageGroups.length - 1) {
			return Infinity; // Already in the highest group
		}

		const nextGroup = ageGroups[currentGroupIndex + 1];
		const nextBirthdayYear = new Date().getFullYear();
		const nextAgeGroupBirthday = new Date(
			nextBirthdayYear,
			dateOfBirth.getMonth(),
			dateOfBirth.getDate()
		);

		// Calculate when child will reach the next age group's minimum age
		const yearsUntilNextGroup = nextGroup.minAge - this.calculateAge(dateOfBirth);
		nextAgeGroupBirthday.setFullYear(nextAgeGroupBirthday.getFullYear() + yearsUntilNextGroup);

		const today = new Date();
		const monthsDiff =
			(nextAgeGroupBirthday.getFullYear() - today.getFullYear()) * 12 +
			(nextAgeGroupBirthday.getMonth() - today.getMonth());

		return Math.max(0, monthsDiff);
	}

	private toParticipantResponse(
		participant: Participant,
		attendance?: Attendance
	): ParticipantResponse {
		const child = participant.child;
		return {
			id: participant.id,
			childId: child.id,
			childFirstName: child.firstName,
			childLastName: child.lastName,
			childAge: this.calculateAge(child.dateOfBirth),
			childAgeGroup: child.currentAgeGroup?.name,
			parentName: child.parentName,
			parentEmail: child.parentEmail,
			parentPhone: child.parentPhone,
			parentWhatsapp: child.parentWhatsapp,
			meetsRequirements: participant.meetsRequirements,
			reasonForInclusion: participant.reasonForInclusion,
			notes: participant.notes,
			invitedAt: participant.invitedAt,
			attendanceStatus: attendance
				? {
						marked: true,
						wasPresent: attendance.wasPresent,
						attendeeType: attendance.attendeeType,
						attendeeName: attendance.attendeeName,
					}
				: { marked: false },
		};
	}
}
