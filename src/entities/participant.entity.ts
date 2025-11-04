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
import { Child } from './child.entity';
import { ParticipationReason } from '../common/enums/participation-reason.enum';

@Entity('participants')
export class Participant {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column({ name: 'activity_id' })
	activityId: string;

	@ManyToOne(() => Activity, (activity) => activity.participants)
	@JoinColumn({ name: 'activity_id' })
	activity: Activity;

	@Column({ name: 'child_id' })
	childId: string;

	@ManyToOne(() => Child, (child) => child.participations)
	@JoinColumn({ name: 'child_id' })
	child: Child;

	@Column({ name: 'meets_requirements', default: true })
	meetsRequirements: boolean;

	@Column({
		name: 'reason_for_inclusion',
		type: 'enum',
		enum: ParticipationReason,
		default: ParticipationReason.NORMAL,
	})
	reasonForInclusion: ParticipationReason;

	@Column({ type: 'text', nullable: true })
	notes: string;

	@Column({ name: 'invited_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
	invitedAt: Date;

	@CreateDateColumn({ name: 'created_at' })
	createdAt: Date;

	@UpdateDateColumn({ name: 'updated_at' })
	updatedAt: Date;
}
