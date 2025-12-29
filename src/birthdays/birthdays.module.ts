import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BirthdaysController } from './birthdays.controller';
import { BirthdaysService } from './birthdays.service';
import { User, UserSchema } from '../schema/user.schema';
import { MonitorProfile, MonitorProfileSchema } from '../schema/monitor-profile.schema';
import { NotificationsModule } from '../notifications/notifications.module';
import { JobsModule } from '../jobs/jobs.module';
import { BirthdaysCron } from '../common/cron/birthdays.cron';
import { RecipientsResolverService } from '../common/services/recipients-resolver.service';
import { AppConfigService } from '../config/app-config.service';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: User.name, schema: UserSchema },
            { name: MonitorProfile.name, schema: MonitorProfileSchema },
        ]),
        NotificationsModule,
        JobsModule,
    ],
    controllers: [BirthdaysController],
    providers: [BirthdaysService, BirthdaysCron, RecipientsResolverService, AppConfigService],
})
export class BirthdaysModule {}
