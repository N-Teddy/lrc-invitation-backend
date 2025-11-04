import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	ManyToOne,
	JoinColumn,
} from 'typeorm';
import { Activity } from './activity.entity';
import { AgeGroup } from './age-group.entity';

@Entity('activity_target_groups')
export class ActivityTargetGroup {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column({ name: 'activity_id' })
	activityId: string;

	@ManyToOne(() => Activity, (activity) => activity.targetGroups, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'activity_id' })
	activity: Activity;

	@Column({ name: 'age_group_id' })
	ageGroupId: string;

	@ManyToOne(() => AgeGroup, (ageGroup) => ageGroup.activityTargets)
	@JoinColumn({ name: 'age_group_id' })
	ageGroup: AgeGroup;

	@CreateDateColumn({ name: 'created_at' })
	createdAt: Date;
}
