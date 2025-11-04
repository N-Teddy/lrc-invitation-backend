import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { EmailService } from './email.service';
import { WhatsAppService } from './whatsapp.service';
import { NotificationLog } from '../../entities/notification-log.entity';
import { Monitor } from '../../entities/monitor.entity';
import { ParticipationModule } from '../participation/participation.module';
import { ActivityModule } from '../activity/activity.module';

@Module({
	imports: [
		TypeOrmModule.forFeature([NotificationLog, Monitor]),
		ParticipationModule,
		ActivityModule,
	],
	controllers: [NotificationController],
	providers: [NotificationService, EmailService, WhatsAppService],
	exports: [NotificationService, EmailService, WhatsAppService],
})
export class NotificationModule {}
