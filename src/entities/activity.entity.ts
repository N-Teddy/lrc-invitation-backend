import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	ManyToOne,
	JoinColumn,
	OneToMany,
} from 'typeorm';
import { Town } from './town.entity';
import { ActivityType } from '../common/enums/activity-type.enum';
import { ActivityTargetGroup } from './activity-target-group.entity';
import { Participant } from './participant.entity';
import { Attendance } from './attendance.entity';
import { NotificationLog } from './notification-log.entity';

@Entity('activities')
export class Activity {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column()
	title: string;

	@Column({
		name: 'activity_type',
		type: 'enum',
		enum: ActivityType,
	})
	activityType: ActivityType;

	@Column({ name: 'town_id' })
	townId: string;

	@ManyToOne(() => Town, (town) => town.activities)
	@JoinColumn({ name: 'town_id' })
	town: Town;

	@Column({ name: 'start_date', type: 'timestamp' })
	startDate: Date;

	@Column({ name: 'end_date', type: 'timestamp' })
	endDate: Date;

	@Column({ nullable: true })
	location: string;

	@Column({ type: 'text', nullable: true })
	description: string;

	@Column({ name: 'participant_list_generated', default: false })
	participantListGenerated: boolean;

	@Column({ name: 'participant_list_generated_at', type: 'timestamp', nullable: true })
	participantListGeneratedAt: Date;

	@OneToMany(() => ActivityTargetGroup, (target) => target.activity, { cascade: true })
	targetGroups: ActivityTargetGroup[];

	@OneToMany(() => Participant, (participant) => participant.activity)
	participants: Participant[];

	@OneToMany(() => Attendance, (attendance) => attendance.activity)
	attendanceRecords: Attendance[];

	@OneToMany(() => NotificationLog, (log) => log.activity)
	notificationLogs: NotificationLog[];

	@CreateDateColumn({ name: 'created_at' })
	createdAt: Date;

	@UpdateDateColumn({ name: 'updated_at' })
	updatedAt: Date;
}
