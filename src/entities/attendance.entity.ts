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
import { Monitor } from './monitor.entity';
import { AttendeeType } from '../request/attendance.request';

@Entity('attendance')
export class Attendance {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column({ name: 'activity_id' })
	activityId: string;

	@ManyToOne(() => Activity, (activity) => activity.attendanceRecords)
	@JoinColumn({ name: 'activity_id' })
	activity: Activity;

	@Column({ name: 'child_id' })
	childId: string;

	@ManyToOne(() => Child, (child) => child.attendanceRecords)
	@JoinColumn({ name: 'child_id' })
	child: Child;

	@Column({ name: 'was_present', default: false })
	wasPresent: boolean;

	@Column({
		name: 'attendee_type',
		type: 'enum',
		enum: AttendeeType,
		default: AttendeeType.CHILD,
	})
	attendeeType: AttendeeType;

	@Column({ name: 'attendee_name', nullable: true })
	attendeeName: string;

	@Column({ name: 'marked_by_monitor_id' })
	markedByMonitorId: string;

	@ManyToOne(() => Monitor, (monitor) => monitor.attendanceRecords)
	@JoinColumn({ name: 'marked_by_monitor_id' })
	markedBy: Monitor;

	@Column({ name: 'marked_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
	markedAt: Date;

	@Column({ name: 'edited', default: false })
	edited: boolean;

	@Column({ name: 'edit_reason', type: 'text', nullable: true })
	editReason: string;

	@CreateDateColumn({ name: 'created_at' })
	createdAt: Date;

	@UpdateDateColumn({ name: 'updated_at' })
	updatedAt: Date;
}
