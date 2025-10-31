import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvitationListController } from './invitation-list.controller';
import { RecipientController } from './recipient.controller';
import { InvitationListService } from './invitation-list.service';
import { MessageFormatterService } from './message-formatter.service';
import { RecipientService } from './recipient.service';
import { NotificationService } from './notification.service';
import { InvitationRecipient } from '../../entities/invitation-recipient.entity';
import { InvitationLog } from '../../entities/invitation-log.entity';
import { Child } from '../../entities/child.entity';
import { Activity } from '../../entities/activity.entity';
import { Attendance } from '../../entities/attendance.entity';
import { Monitor } from '../../entities/monitor.entity';
import { WhatsAppModule } from '../whatsapp/whatsapp.module';
import { InvitationsCronService } from 'src/common/cron/invitation-cron.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            InvitationRecipient,
            InvitationLog,
            Child,
            Activity,
            Attendance,
            Monitor,
        ]),
        WhatsAppModule,
    ],
    controllers: [
        InvitationListController,
        RecipientController,
    ],
    providers: [
        InvitationListService,
        InvitationsCronService,
        MessageFormatterService,
        RecipientService,
        NotificationService,
    ],
    exports: [
        InvitationListService,
        RecipientService,
        NotificationService,
    ],
})
export class InvitationsModule { }
