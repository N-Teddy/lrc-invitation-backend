import { ConfigService } from '@nestjs/config';
import { DataSource, DataSourceOptions } from 'typeorm';

const configService = new ConfigService();

export const dataSourceOptions: DataSourceOptions = {
	type: 'postgres',
	host: configService.get('DB_HOST'),
	port: configService.get('DB_PORT'),
	username: configService.get('DB_USERNAME'),
	password: configService.get('DB_PASSWORD'),
	database: configService.get('DB_DATABASE'),
	entities: ['dist/entities/**/*.entity.js'],
	migrations: ['dist/database/migrations/**/*.js'],
	synchronize: false,
	logging: configService.get('NODE_ENV') === 'development',
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
