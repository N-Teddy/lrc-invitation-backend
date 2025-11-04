import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AgeGroup } from '../../entities/age-group.entity';
import { BusinessException } from '../../common/exceptions/business.exception';

@Injectable()
export class AgeGroupService {
	constructor(
		@InjectRepository(AgeGroup)
		private ageGroupRepository: Repository<AgeGroup>
	) {}

	async findAll(): Promise<AgeGroup[]> {
		return this.ageGroupRepository.find({
			order: { minAge: 'ASC' },
		});
	}

	async findOne(id: string): Promise<AgeGroup> {
		const ageGroup = await this.ageGroupRepository.findOne({ where: { id } });

		if (!ageGroup) {
			throw new BusinessException('Age group not found');
		}

		return ageGroup;
	}

	async findByAge(age: number): Promise<AgeGroup> {
		const ageGroups = await this.findAll();

		for (const group of ageGroups) {
			if (age >= group.minAge && (group.maxAge === null || age <= group.maxAge)) {
				return group;
			}
		}

		throw new BusinessException('No suitable age group found for this age');
	}
}
