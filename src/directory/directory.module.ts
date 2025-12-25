import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DirectoryController } from './directory.controller';
import { DirectoryService } from './directory.service';
import { User, UserSchema } from '../schema/user.schema';
import { MonitorProfile, MonitorProfileSchema } from '../schema/monitor-profile.schema';
import { TownScopeService } from '../common/services/town-scope.service';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: User.name, schema: UserSchema },
            { name: MonitorProfile.name, schema: MonitorProfileSchema },
        ]),
    ],
    controllers: [DirectoryController],
    providers: [DirectoryService, TownScopeService],
    exports: [DirectoryService],
})
export class DirectoryModule {}
