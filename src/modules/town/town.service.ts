import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Town } from '../../entities/town.entity';
import { BusinessException } from '../../common/exceptions/business.exception';

@Injectable()
export class TownService {
	constructor(
		@InjectRepository(Town)
		private townRepository: Repository<Town>
	) {}

	async findAll(): Promise<Town[]> {
		return this.townRepository.find();
	}

	async findOne(id: string): Promise<Town> {
		const town = await this.townRepository.findOne({ where: { id } });

		if (!town) {
			throw new BusinessException('Town not found');
		}

		return town;
	}
}
