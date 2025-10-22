import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
    Index,
} from 'typeorm';
import { Child } from './child.entity';
import { Activity } from './activity.entity';
import { Monitor } from './monitor.entity';

@Entity('attendance')
@Index(['childId', 'activityId'], { unique: true })
export class Attendance {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'int' })
    childId: number;

    @Column({ type: 'int' })
    activityId: number;

    @Column({ type: 'int' })
    monitorId: number;

    @Column({ type: 'boolean', default: true })
    present: boolean;

    @Column({ type: 'text', nullable: true })
    notes: string;

    @CreateDateColumn({ type: 'timestamp' })
    recordedAt: Date;

    // Relations
    @ManyToOne(() => Child, (child) => child.attendanceRecords)
    @JoinColumn({ name: 'childId' })
    child: Child;

    @ManyToOne(() => Activity, (activity) => activity.attendanceRecords)
    @JoinColumn({ name: 'activityId' })
    activity: Activity;

    @ManyToOne(() => Monitor, (monitor) => monitor.attendanceRecords)
    @JoinColumn({ name: 'monitorId' })
    monitor: Monitor;
}
