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
import { AgeGroup } from './age-group.entity';
import { Participant } from './participant.entity';
import { Attendance } from './attendance.entity';

@Entity('children')
export class Child {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column({ name: 'first_name' })
	firstName: string;

	@Column({ name: 'last_name' })
	lastName: string;

	@Column({ name: 'date_of_birth', type: 'date' })
	dateOfBirth: Date;

	@Column({ name: 'current_age_group_id' })
	currentAgeGroupId: string;

	@ManyToOne(() => AgeGroup, (ageGroup) => ageGroup.children)
	@JoinColumn({ name: 'current_age_group_id' })
	currentAgeGroup: AgeGroup;

	@Column({ name: 'town_id' })
	townId: string;

	@ManyToOne(() => Town, (town) => town.children)
	@JoinColumn({ name: 'town_id' })
	town: Town;

	@Column({ name: 'parent_name' })
	parentName: string;

	@Column({ name: 'parent_email', nullable: true })
	parentEmail: string;

	@Column({ name: 'parent_phone' })
	parentPhone: string;

	@Column({ name: 'parent_whatsapp', nullable: true })
	parentWhatsapp: string;

	@Column({ name: 'is_active', default: true })
	isActive: boolean;

	@OneToMany(() => Participant, (participant) => participant.child)
	participations: Participant[];

	@OneToMany(() => Attendance, (attendance) => attendance.child)
	attendanceRecords: Attendance[];

	@CreateDateColumn({ name: 'created_at' })
	createdAt: Date;

	@UpdateDateColumn({ name: 'updated_at' })
	updatedAt: Date;
}
