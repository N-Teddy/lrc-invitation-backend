import { DataSource } from 'typeorm';
import { Setting } from '../../entities/setting.entity';

export async function seedInitialSettings(dataSource: DataSource) {
    const settingRepository = dataSource.getRepository(Setting);

    const settings = [
        {
            settingKey: 'group_a_min',
            settingValue: '5',
            description: 'Group A minimum age',
        },
        {
            settingKey: 'group_a_max',
            settingValue: '7',
            description: 'Group A maximum age',
        },
        {
            settingKey: 'group_b_min',
            settingValue: '8',
            description: 'Group B minimum age',
        },
        {
            settingKey: 'group_b_max',
            settingValue: '11',
            description: 'Group B maximum age',
        },
        {
            settingKey: 'group_c_min',
            settingValue: '12',
            description: 'Group C minimum age',
        },
        {
            settingKey: 'group_c_max',
            settingValue: '15',
            description: 'Group C maximum age',
        },
        {
            settingKey: 'group_d_min',
            settingValue: '16',
            description: 'Group D minimum age',
        },
        {
            settingKey: 'group_d_max',
            settingValue: '18',
            description: 'Group D maximum age',
        },
        {
            settingKey: 'nearing_age_threshold',
            settingValue: '3',
            description: 'Months before birthday to consider for next group',
        },
        {
            settingKey: 'conference_service_requirement',
            settingValue: '2',
            description: 'Number of services required for conference',
        },
        {
            settingKey: 'invitation_lead_weeks',
            settingValue: '3',
            description: 'Weeks before activity to generate invites',
        },
    ];

    for (const setting of settings) {
        const exists = await settingRepository.findOne({
            where: { settingKey: setting.settingKey },
        });

        if (!exists) {
            await settingRepository.save(setting);
        }
    }

    console.log('✅ Initial settings seeded successfully');
}
