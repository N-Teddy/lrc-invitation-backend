import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import dataSource from '../../config/database.config';
import { Town } from '../../entities/town.entity';
import { AgeGroup } from '../../entities/age-group.entity';
import { Monitor } from '../../entities/monitor.entity';
import { SystemConfiguration } from '../../entities/system-configuration.entity';
import { Role } from '../../common/enums/role.enum';

async function seed() {
	try {
		await dataSource.initialize();
		console.log('Database connection established');

		const townRepository = dataSource.getRepository(Town);
		const ageGroupRepository = dataSource.getRepository(AgeGroup);
		const monitorRepository = dataSource.getRepository(Monitor);
		const configRepository = dataSource.getRepository(SystemConfiguration);

		// Seed Towns
		console.log('Seeding towns...');
		const towns = [{ name: 'Yaounde' }, { name: 'Douala' }, { name: 'Edea' }];

		const savedTowns = [];
		for (const town of towns) {
			const existing = await townRepository.findOne({ where: { name: town.name } });
			if (!existing) {
				const newTown = townRepository.create(town);
				savedTowns.push(await townRepository.save(newTown));
				console.log(`Created town: ${town.name}`);
			} else {
				savedTowns.push(existing);
				console.log(`Town already exists: ${town.name}`);
			}
		}

		// Seed Age Groups
		console.log('Seeding age groups...');
		const ageGroups = [
			{ name: 'Pre-A', minAge: 0, maxAge: 4 },
			{ name: 'A', minAge: 5, maxAge: 8 },
			{ name: 'B', minAge: 9, maxAge: 12 },
			{ name: 'C', minAge: 13, maxAge: 14 },
			{ name: 'D', minAge: 15, maxAge: 18 },
		];

		for (const group of ageGroups) {
			const existing = await ageGroupRepository.findOne({ where: { name: group.name } });
			if (!existing) {
				const newGroup = ageGroupRepository.create(group);
				await ageGroupRepository.save(newGroup);
				console.log(`Created age group: ${group.name}`);
			} else {
				console.log(`Age group already exists: ${group.name}`);
			}
		}

		// Seed System Configurations
		console.log('Seeding system configurations...');
		const configurations = [
			{
				key: 'age_promotion_threshold_months',
				value: '6',
				description: 'Number of months before birthday for age promotion eligibility',
				dataType: 'number',
			},
			{
				key: 'conference_prerequisite_services',
				value: '1',
				description: 'Minimum number of services required to attend a conference',
				dataType: 'number',
			},
			{
				key: 'participant_list_generation_weeks',
				value: '3',
				description: 'Number of weeks before activity to generate participant list',
				dataType: 'number',
			},
			{
				key: 'annual_monitor_contribution',
				value: '12000',
				description: 'Annual contribution amount for monitors (FCFA)',
				dataType: 'number',
			},
		];

		for (const config of configurations) {
			const existing = await configRepository.findOne({ where: { key: config.key } });
			if (!existing) {
				const newConfig = configRepository.create(config);
				await configRepository.save(newConfig);
				console.log(`Created configuration: ${config.key}`);
			} else {
				console.log(`Configuration already exists: ${config.key}`);
			}
		}

		// Seed Default Dev Account
		console.log('Seeding default dev account...');
		const devEmail = 'dev@churchactivities.com';
		const existingDev = await monitorRepository.findOne({ where: { email: devEmail } });

		if (!existingDev) {
			const hashedPassword = await bcrypt.hash('Dev@123456', 10);
			const devMonitor = monitorRepository.create({
				firstName: 'System',
				lastName: 'Developer',
				email: devEmail,
				password: hashedPassword,
				phone: '+237000000000',
				role: Role.DEV,
				isActive: true,
			});
			await monitorRepository.save(devMonitor);
			console.log(
				'Created dev account - Email: dev@churchactivities.com, Password: Dev@123456'
			);
		} else {
			console.log('Dev account already exists');
		}

		// Seed Super Monitor Account
		console.log('Seeding super monitor account...');
		const superMonitorEmail = 'supermonitor@churchactivities.com';
		const existingSuperMonitor = await monitorRepository.findOne({
			where: { email: superMonitorEmail },
		});

		if (!existingSuperMonitor) {
			const hashedPassword = await bcrypt.hash('Super@123456', 10);
			const superMonitor = monitorRepository.create({
				firstName: 'Super',
				lastName: 'Monitor',
				email: superMonitorEmail,
				password: hashedPassword,
				phone: '+237111111111',
				role: Role.SUPER_MONITOR,
				townId: savedTowns[0].id, // Assign to Yaounde
				isActive: true,
			});
			await monitorRepository.save(superMonitor);
			console.log(
				'Created super monitor account - Email: supermonitor@churchactivities.com, Password: Super@123456'
			);
		} else {
			console.log('Super monitor account already exists');
		}

		console.log('Seeding completed successfully!');
		await dataSource.destroy();
	} catch (error) {
		console.error('Seeding failed:', error);
		process.exit(1);
	}
}

seed();
