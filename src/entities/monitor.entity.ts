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
import { Role } from '../common/enums/role.enum';
import { MonitorContribution } from './monitor-contribution.entity';
import { Attendance } from './attendance.entity';

@Entity('monitors')
export class Monitor {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column({ name: 'first_name' })
	firstName: string;

	@Column({ name: 'last_name' })
	lastName: string;

	@Column({ unique: true })
	email: string;

	@Column({ select: false })
	password: string;

	@Column()
	phone: string;

	@Column({ name: 'whatsapp_number', nullable: true })
	whatsappNumber: string;

	@Column({
		type: 'enum',
		enum: Role,
		default: Role.MONITOR,
	})
	role: Role;

	@Column({ name: 'town_id', nullable: true })
	townId: string;

	@ManyToOne(() => Town, (town) => town.monitors, { nullable: true })
	@JoinColumn({ name: 'town_id' })
	town: Town;

	@Column({ name: 'is_active', default: true })
	isActive: boolean;

	@OneToMany(() => MonitorContribution, (contribution) => contribution.monitor)
	contributions: MonitorContribution[];

	@OneToMany(() => Attendance, (attendance) => attendance.markedBy)
	attendanceRecords: Attendance[];

	@CreateDateColumn({ name: 'created_at' })
	createdAt: Date;

	@UpdateDateColumn({ name: 'updated_at' })
	updatedAt: Date;
}
