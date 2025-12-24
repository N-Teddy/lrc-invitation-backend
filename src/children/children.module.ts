import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChildrenController } from './children.controller';
import { ChildrenService } from './children.service';
import { User, UserSchema } from '../schema/user.schema';
import { ChildProfile, ChildProfileSchema } from '../schema/child-profile.schema';
import { MonitorProfile, MonitorProfileSchema } from '../schema/monitor-profile.schema';
import { TownScopeService } from '../common/services/town-scope.service';
import { SettingsModule } from '../settings/settings.module';
import { MediaModule } from '../media/media.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { UsersModule } from '../users/users.module';
import { AppConfigService } from '../config/app-config.service';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: User.name, schema: UserSchema },
            { name: ChildProfile.name, schema: ChildProfileSchema },
            { name: MonitorProfile.name, schema: MonitorProfileSchema },
        ]),
        SettingsModule,
        MediaModule,
        NotificationsModule,
        UsersModule,
    ],
    controllers: [ChildrenController],
    providers: [ChildrenService, TownScopeService, AppConfigService],
    exports: [ChildrenService],
})
export class ChildrenModule {}
