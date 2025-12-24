import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User, UserSchema } from '../schema/user.schema';
import { MonitorProfile, MonitorProfileSchema } from '../schema/monitor-profile.schema';
import { MediaModule } from '../media/media.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { AppConfigService } from '../config/app-config.service';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: User.name, schema: UserSchema },
            { name: MonitorProfile.name, schema: MonitorProfileSchema },
        ]),
        MediaModule,
        NotificationsModule,
    ],
    controllers: [UsersController],
    providers: [UsersService, AppConfigService],
    exports: [UsersService],
})
export class UsersModule {}
