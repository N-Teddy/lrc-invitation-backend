import { ConfigService } from '@nestjs/config';
import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

const configService = new ConfigService();
const isDevelopment = configService.get('NODE_ENV') === 'development' || process.env.NODE_ENV === 'development';

export const dataSourceOptions: DataSourceOptions = {
	type: 'postgres',
	host: configService.get('DB_HOST') || process.env.DB_HOST,
	port: configService.get('DB_PORT') || parseInt(process.env.DB_PORT || '5432'),
	username: configService.get('DB_USERNAME') || process.env.DB_USERNAME,
	password: configService.get('DB_PASSWORD') || process.env.DB_PASSWORD,
	database: configService.get('DB_DATABASE') || process.env.DB_DATABASE,
	entities: isDevelopment
		? ['src/entities/**/*.entity.ts']  // For ts-node/development
		: ['dist/entities/**/*.entity.js'], // For production
	migrations: isDevelopment
		? ['src/database/migrations/**/*.ts']
		: ['dist/database/migrations/**/*.js'],
	synchronize: false,
	logging: isDevelopment,
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;