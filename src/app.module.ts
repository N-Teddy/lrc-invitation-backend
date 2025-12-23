import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { NotificationsModule } from './notifications/notifications.module';
import { MediaModule } from './media/media.module';
import { GroupsModule } from './groups/groups.module';
import { ActivitiesModule } from './activities/activities.module';
import { AttendanceModule } from './attendance/attendance.module';
import { ReportingModule } from './reporting/reporting.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        MongooseModule.forRootAsync({
            useFactory: (configService: ConfigService) => ({
                uri:
                    configService.get<string>('MONGODB_URI') ??
                    'mongodb://localhost:27017/lrc-jeuness',
            }),
            inject: [ConfigService],
        }),
        UsersModule,
        AuthModule,
        NotificationsModule,
        MediaModule,
        GroupsModule,
        ActivitiesModule,
        AttendanceModule,
        ReportingModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
