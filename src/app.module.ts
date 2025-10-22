import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';
import appConfig from './config/app.config';
import { AuthModule } from './modules/auth/auth.module';
import { MonitorsModule } from './modules/monitors/monitors.module';
import { ChildrenModule } from './modules/children/children.module';
import { ActivitiesModule } from './modules/activities/activities.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { InvitationsModule } from './modules/invitations/invitations.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, jwtConfig, appConfig],
    }),

    // Database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) =>
        configService.get('database'),
      inject: [ConfigService],
    }),

    // Scheduling for cron jobs
    ScheduleModule.forRoot(),

    // Feature modules
    AuthModule,
    MonitorsModule,
    ChildrenModule,
    ActivitiesModule,
    AttendanceModule,
    InvitationsModule,
  ],
})
export class AppModule { }
