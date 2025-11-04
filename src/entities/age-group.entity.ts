import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	OneToMany,
} from 'typeorm';
import { Child } from './child.entity';
import { ActivityTargetGroup } from './activity-target-group.entity';

@Entity('age_groups')
export class AgeGroup {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column({ unique: true })
	name: string;

	@Column({ name: 'min_age' })
	minAge: number;

	@Column({ name: 'max_age', nullable: true })
	maxAge: number;

	@OneToMany(() => Child, (child) => child.currentAgeGroup)
	children: Child[];

	@OneToMany(() => ActivityTargetGroup, (target) => target.ageGroup)
	activityTargets: ActivityTargetGroup[];

	@CreateDateColumn({ name: 'created_at' })
	createdAt: Date;

	@UpdateDateColumn({ name: 'updated_at' })
	updatedAt: Date;
}
