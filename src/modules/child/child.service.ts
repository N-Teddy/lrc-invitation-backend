import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Child } from '../../entities/child.entity';
import { AgeGroup } from '../../entities/age-group.entity';
import { CreateChildRequest, UpdateChildRequest } from '../../request/child.request';
import { ChildResponse } from '../../response/child.response';
import { BusinessException } from '../../common/exceptions/business.exception';

@Injectable()
export class ChildService {
	constructor(
		@InjectRepository(Child)
		private childRepository: Repository<Child>,
		@InjectRepository(AgeGroup)
		private ageGroupRepository: Repository<AgeGroup>
	) {}

	async create(createRequest: CreateChildRequest): Promise<ChildResponse> {
		const dateOfBirth = new Date(createRequest.dateOfBirth);
		const ageGroup = await this.determineAgeGroup(dateOfBirth);

		const child = this.childRepository.create({
			...createRequest,
			dateOfBirth,
			currentAgeGroupId: ageGroup.id,
		});

		const savedChild = await this.childRepository.save(child);
		return this.findOne(savedChild.id);
	}

	async findAll(townId?: string, ageGroupId?: string): Promise<ChildResponse[]> {
		const query = this.childRepository
			.createQueryBuilder('child')
			.leftJoinAndSelect('child.currentAgeGroup', 'ageGroup')
			.leftJoinAndSelect('child.town', 'town')
			.where('child.isActive = :isActive', { isActive: true });

		if (townId) {
			query.andWhere('child.townId = :townId', { townId });
		}

		if (ageGroupId) {
			query.andWhere('child.currentAgeGroupId = :ageGroupId', { ageGroupId });
		}

		const children = await query.getMany();
		return children.map((child) => this.toResponse(child));
	}

	async findOne(id: string): Promise<ChildResponse> {
		const child = await this.childRepository.findOne({
			where: { id },
			relations: ['currentAgeGroup', 'town'],
		});

		if (!child) {
			throw new BusinessException('Child not found');
		}

		return this.toResponse(child);
	}

	async update(id: string, updateRequest: UpdateChildRequest): Promise<ChildResponse> {
		const child = await this.childRepository.findOne({ where: { id } });

		if (!child) {
			throw new BusinessException('Child not found');
		}

		if (updateRequest.dateOfBirth) {
			const dateOfBirth = new Date(updateRequest.dateOfBirth);
			const ageGroup = await this.determineAgeGroup(dateOfBirth);
			updateRequest['currentAgeGroupId'] = ageGroup.id;
			updateRequest['dateOfBirth'] = dateOfBirth as any;
		}

		Object.assign(child, updateRequest);
		await this.childRepository.save(child);

		return this.findOne(id);
	}

	async remove(id: string): Promise<void> {
		const child = await this.childRepository.findOne({ where: { id } });

		if (!child) {
			throw new BusinessException('Child not found');
		}

		await this.childRepository.update(id, { isActive: false });
	}

	async updateAgeGroups(): Promise<void> {
		const children = await this.childRepository.find({
			where: { isActive: true },
		});

		for (const child of children) {
			const ageGroup = await this.determineAgeGroup(child.dateOfBirth);
			if (ageGroup.id !== child.currentAgeGroupId) {
				await this.childRepository.update(child.id, {
					currentAgeGroupId: ageGroup.id,
				});
			}
		}
	}

	private async determineAgeGroup(dateOfBirth: Date): Promise<AgeGroup> {
		const age = this.calculateAge(dateOfBirth);
		const ageGroups = await this.ageGroupRepository.find({
			order: { minAge: 'ASC' },
		});

		for (const group of ageGroups) {
			if (age >= group.minAge && (group.maxAge === null || age <= group.maxAge)) {
				return group;
			}
		}

		throw new BusinessException('No suitable age group found for this age');
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

	private toResponse(child: Child): ChildResponse {
		return {
			id: child.id,
			firstName: child.firstName,
			lastName: child.lastName,
			dateOfBirth: child.dateOfBirth,
			age: this.calculateAge(child.dateOfBirth),
			currentAgeGroupId: child.currentAgeGroupId,
			currentAgeGroupName: child.currentAgeGroup?.name,
			townId: child.townId,
			townName: child.town?.name,
			parentName: child.parentName,
			parentEmail: child.parentEmail,
			parentPhone: child.parentPhone,
			parentWhatsapp: child.parentWhatsapp,
			isActive: child.isActive,
			createdAt: child.createdAt,
			updatedAt: child.updatedAt,
		};
	}
}
