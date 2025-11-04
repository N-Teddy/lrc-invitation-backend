import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SystemConfiguration } from '../../entities/system-configuration.entity';
import { UpdateConfigurationRequest } from '../../request/configuration.request';
import { BusinessException } from '../../common/exceptions/business.exception';

@Injectable()
export class ConfigurationService {
	constructor(
		@InjectRepository(SystemConfiguration)
		private configRepository: Repository<SystemConfiguration>
	) {}

	async findAll(): Promise<SystemConfiguration[]> {
		return this.configRepository.find();
	}

	async findByKey(key: string): Promise<SystemConfiguration> {
		const config = await this.configRepository.findOne({ where: { key } });

		if (!config) {
			throw new BusinessException(`Configuration '${key}' not found`);
		}

		return config;
	}

	async getValue(key: string): Promise<any> {
		const config = await this.findByKey(key);
		return this.parseValue(config.value, config.dataType);
	}

	async update(
		key: string,
		updateRequest: UpdateConfigurationRequest
	): Promise<SystemConfiguration> {
		const config = await this.findByKey(key);

		config.value = updateRequest.value;
		if (updateRequest.description) {
			config.description = updateRequest.description;
		}

		return this.configRepository.save(config);
	}

	private parseValue(value: string, dataType: string): any {
		switch (dataType) {
			case 'number':
				return parseFloat(value);
			case 'boolean':
				return value === 'true';
			default:
				return value;
		}
	}

	// Helper methods for commonly used configurations
	async getAgePromotionThreshold(): Promise<number> {
		return this.getValue('age_promotion_threshold_months');
	}

	async getConferencePrerequisiteServices(): Promise<number> {
		return this.getValue('conference_prerequisite_services');
	}

	async getParticipantListGenerationWeeks(): Promise<number> {
		return this.getValue('participant_list_generation_weeks');
	}

	async getAnnualMonitorContribution(): Promise<number> {
		return this.getValue('annual_monitor_contribution');
	}
}
