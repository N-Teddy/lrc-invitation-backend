import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import appConfig from './config/app.config';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';

// Modules
import { AuthModule } from './modules/auth/auth.module';
import { MonitorModule } from './modules/monitor/monitor.module';
import { ChildModule } from './modules/child/child.module';
import { TownModule } from './modules/town/town.module';
import { AgeGroupModule } from './modules/age-group/age-group.module';
import { ActivityModule } from './modules/activity/activity.module';
import { ParticipationModule } from './modules/participation/participation.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { ContributionModule } from './modules/contribution/contribution.module';
import { ConfigurationModule } from './modules/configuration/configuration.module';
import { NotificationModule } from './modules/notification/notification.module';
import { SchedulerModule } from './modules/scheduler/scheduler.module';

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			load: [appConfig],
		}),
		TypeOrmModule.forRootAsync({
			imports: [ConfigModule],
			useFactory: (configService: ConfigService) => ({
				type: 'postgres',
				host: configService.get('database.host'),
				port: configService.get('database.port'),
				username: configService.get('database.username'),
				password: configService.get('database.password'),
				database: configService.get('database.database'),
				entities: [__dirname + '/entities/**/*.entity{.ts,.js}'],
				synchronize: configService.get('NODE_ENV') === 'development',
				logging: configService.get('NODE_ENV') === 'development',
			}),
			inject: [ConfigService],
		}),
		AuthModule,
		MonitorModule,
		ChildModule,
		TownModule,
		AgeGroupModule,
		ActivityModule,
		ParticipationModule,
		AttendanceModule,
		ContributionModule,
		ConfigurationModule,
		NotificationModule,
		SchedulerModule,
	],
	providers: [
		{
			provide: APP_GUARD,
			useClass: JwtAuthGuard,
		},
		{
			provide: APP_GUARD,
			useClass: RolesGuard,
		},
	],
})
export class AppModule {}
