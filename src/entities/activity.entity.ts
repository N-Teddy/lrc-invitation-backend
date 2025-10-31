import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
} from 'typeorm';
import { ActivityType } from '../common/enums/activity-type.enum';
import { Region } from '../common/enums/region.enum';
import { Attendance } from './attendance.entity';
import { InvitationRecipient } from './invitation-recipient.entity';
import { InvitationLog } from './invitation-log.entity';

@Entity('activities')
export class Activity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 255 })
    name: string;

    @Column({
        type: 'enum',
        enum: ActivityType,
    })
    type: ActivityType;

    @Column({ type: 'date' })
    date: Date;

    @Column({ type: 'time', nullable: true })
    time: string;

    @Column({
        type: 'enum',
        enum: Region,
    })
    region: Region;

    @Column({ type: 'simple-array' })
    allowedGroups: string[]; // e.g., ["Pre-School", "Primary 1-3"]

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ type: 'varchar', length: 500, nullable: true })
    location: string;

    @Column({ type: 'int' })
    createdByMonitorId: number;

    @CreateDateColumn({ type: 'timestamp' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updatedAt: Date;

    // Relations
    @OneToMany(() => Attendance, (attendance) => attendance.activity)
    attendanceRecords: Attendance[];

    @OneToMany(() => InvitationRecipient, (recipient) => recipient.activity)
    invitationRecipients: InvitationRecipient[];

    @OneToMany(() => InvitationLog, (log) => log.activity)
    invitationLogs: InvitationLog[];
}
