import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Between, LessThan } from 'typeorm';
import { Activity } from '../../entities/activity.entity';
import { ActivityTargetGroup } from '../../entities/activity-target-group.entity';
import { CreateActivityRequest, UpdateActivityRequest } from '../../request/activity.request';
import { ActivityResponse } from '../../response/activity.response';
import { BusinessException } from '../../common/exceptions/business.exception';

@Injectable()
export class ActivityService {
	constructor(
		@InjectRepository(Activity)
		private activityRepository: Repository<Activity>,
		@InjectRepository(ActivityTargetGroup)
		private targetGroupRepository: Repository<ActivityTargetGroup>
	) {}

	async create(createRequest: CreateActivityRequest): Promise<ActivityResponse> {
		const activity = this.activityRepository.create({
			title: createRequest.title,
			activityType: createRequest.activityType,
			townId: createRequest.townId,
			startDate: new Date(createRequest.startDate),
			endDate: new Date(createRequest.endDate),
			location: createRequest.location,
			description: createRequest.description,
		});

		const savedActivity = await this.activityRepository.save(activity);

		// Create target groups
		const targetGroups = createRequest.targetGroupIds.map((ageGroupId) =>
			this.targetGroupRepository.create({
				activityId: savedActivity.id,
				ageGroupId,
			})
		);

		await this.targetGroupRepository.save(targetGroups);

		return this.findOne(savedActivity.id);
	}

	async findAll(
		townId?: string,
		startDate?: string,
		endDate?: string
	): Promise<ActivityResponse[]> {
		const query = this.activityRepository
			.createQueryBuilder('activity')
			.leftJoinAndSelect('activity.town', 'town')
			.leftJoinAndSelect('activity.targetGroups', 'targetGroups')
			.leftJoinAndSelect('targetGroups.ageGroup', 'ageGroup')
			.leftJoinAndSelect('activity.participants', 'participants');

		if (townId) {
			query.andWhere('activity.townId = :townId', { townId });
		}

		if (startDate && endDate) {
			query.andWhere('activity.startDate BETWEEN :startDate AND :endDate', {
				startDate: new Date(startDate),
				endDate: new Date(endDate),
			});
		}

		query.orderBy('activity.startDate', 'ASC');

		const activities = await query.getMany();
		return activities.map((activity) => this.toResponse(activity));
	}

	async findOne(id: string): Promise<ActivityResponse> {
		const activity = await this.activityRepository.findOne({
			where: { id },
			relations: ['town', 'targetGroups', 'targetGroups.ageGroup', 'participants'],
		});

		if (!activity) {
			throw new BusinessException('Activity not found');
		}

		return this.toResponse(activity);
	}

	async update(id: string, updateRequest: UpdateActivityRequest): Promise<ActivityResponse> {
		const activity = await this.activityRepository.findOne({
			where: { id },
			relations: ['targetGroups'],
		});

		if (!activity) {
			throw new BusinessException('Activity not found');
		}

		// Update basic fields
		if (updateRequest.title) activity.title = updateRequest.title;
		if (updateRequest.activityType) activity.activityType = updateRequest.activityType;
		if (updateRequest.townId) activity.townId = updateRequest.townId;
		if (updateRequest.startDate) activity.startDate = new Date(updateRequest.startDate);
		if (updateRequest.endDate) activity.endDate = new Date(updateRequest.endDate);
		if (updateRequest.location !== undefined) activity.location = updateRequest.location;
		if (updateRequest.description !== undefined)
			activity.description = updateRequest.description;

		await this.activityRepository.save(activity);

		// Update target groups if provided
		if (updateRequest.targetGroupIds) {
			await this.targetGroupRepository.delete({ activityId: id });

			const targetGroups = updateRequest.targetGroupIds.map((ageGroupId) =>
				this.targetGroupRepository.create({
					activityId: id,
					ageGroupId,
				})
			);

			await this.targetGroupRepository.save(targetGroups);
		}

		return this.findOne(id);
	}

	async remove(id: string): Promise<void> {
		const activity = await this.activityRepository.findOne({ where: { id } });

		if (!activity) {
			throw new BusinessException('Activity not found');
		}

		await this.activityRepository.remove(activity);
	}

	async findActivitiesForParticipantGeneration(weeksAhead: number): Promise<Activity[]> {
		const now = new Date();
		const futureDate = new Date();
		futureDate.setDate(futureDate.getDate() + weeksAhead * 7);

		return this.activityRepository.find({
			where: {
				startDate: Between(now, futureDate),
				participantListGenerated: false,
			},
			relations: ['targetGroups', 'targetGroups.ageGroup', 'town'],
		});
	}

	async markParticipantListGenerated(activityId: string): Promise<void> {
		await this.activityRepository.update(activityId, {
			participantListGenerated: true,
			participantListGeneratedAt: new Date(),
		});
	}

	private toResponse(activity: Activity): ActivityResponse {
		return {
			id: activity.id,
			title: activity.title,
			activityType: activity.activityType,
			townId: activity.townId,
			townName: activity.town?.name,
			startDate: activity.startDate,
			endDate: activity.endDate,
			location: activity.location,
			description: activity.description,
			participantListGenerated: activity.participantListGenerated,
			participantListGeneratedAt: activity.participantListGeneratedAt,
			targetGroupIds: activity.targetGroups?.map((tg) => tg.ageGroupId) || [],
			targetGroupNames: activity.targetGroups?.map((tg) => tg.ageGroup?.name) || [],
			participantCount: activity.participants?.length || 0,
			createdAt: activity.createdAt,
			updatedAt: activity.updatedAt,
		};
	}
}
