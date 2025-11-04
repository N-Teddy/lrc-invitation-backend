import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	ManyToOne,
	JoinColumn,
} from 'typeorm';
import { Activity } from './activity.entity';
import { RecipientType } from '../common/enums/recipient-type.enum';
import { NotificationChannel } from '../common/enums/notification-channel.enum';
import { NotificationStatus } from '../common/enums/notification-status.enum';

@Entity('notification_logs')
export class NotificationLog {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column({ name: 'activity_id', nullable: true })
	activityId: string;

	@ManyToOne(() => Activity, (activity) => activity.notificationLogs, { nullable: true })
	@JoinColumn({ name: 'activity_id' })
	activity: Activity;

	@Column({
		name: 'recipient_type',
		type: 'enum',
		enum: RecipientType,
	})
	recipientType: RecipientType;

	@Column({ name: 'recipient_id' })
	recipientId: string;

	@Column({ name: 'recipient_email', nullable: true })
	recipientEmail: string;

	@Column({ name: 'recipient_whatsapp', nullable: true })
	recipientWhatsapp: string;

	@Column({
		type: 'enum',
		enum: NotificationChannel,
	})
	channel: NotificationChannel;

	@Column({
		type: 'enum',
		enum: NotificationStatus,
		default: NotificationStatus.PENDING,
	})
	status: NotificationStatus;

	@Column({ type: 'text', nullable: true })
	message: string;

	@Column({ name: 'error_message', type: 'text', nullable: true })
	errorMessage: string;

	@Column({ name: 'sent_at', type: 'timestamp', nullable: true })
	sentAt: Date;

	@CreateDateColumn({ name: 'created_at' })
	createdAt: Date;

	@UpdateDateColumn({ name: 'updated_at' })
	updatedAt: Date;
}
