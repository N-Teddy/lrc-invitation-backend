import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	OneToMany,
} from 'typeorm';
import { Monitor } from './monitor.entity';
import { Child } from './child.entity';
import { Activity } from './activity.entity';

@Entity('towns')
export class Town {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column({ unique: true })
	name: string;

	@OneToMany(() => Monitor, (monitor) => monitor.town)
	monitors: Monitor[];

	@OneToMany(() => Child, (child) => child.town)
	children: Child[];

	@OneToMany(() => Activity, (activity) => activity.town)
	activities: Activity[];

	@CreateDateColumn({ name: 'created_at' })
	createdAt: Date;

	@UpdateDateColumn({ name: 'updated_at' })
	updatedAt: Date;
}
