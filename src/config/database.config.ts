import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { join } from 'path';

export default registerAs(
    'database',
    (): TypeOrmModuleOptions => ({
        type: 'sqlite',
        database: process.env.DATABASE_PATH || 'church-management.db',
        entities: [join(__dirname, '..', 'entities', '*.entity{.ts,.js}')],
        synchronize: process.env.NODE_ENV !== 'production', // Auto-sync in dev only
        logging: process.env.NODE_ENV === 'development',
        migrations: [join(__dirname, '..', 'database', 'migrations', '*{.ts,.js}')],
        migrationsRun: true,
    }),
);
