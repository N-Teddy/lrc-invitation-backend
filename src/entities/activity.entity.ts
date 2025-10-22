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
import { AgeGroup } from '../common/enums/age-group.enum';
import { Attendance } from './attendance.entity';
import { Invitation } from './invitation.entity';

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

    @Column({
        type: 'enum',
        enum: AgeGroup,
        nullable: true,
    })
    targetAgeGroup: AgeGroup;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ type: 'varchar', length: 500, nullable: true })
    location: string;

    @Column({ type: 'int' })
    monitorId: number;

    @CreateDateColumn({ type: 'timestamp' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updatedAt: Date;

    @OneToMany(() => Attendance, (attendance) => attendance.activity)
    attendanceRecords: Attendance[];

    @OneToMany(() => Invitation, (invitation) => invitation.activity)
    invitations: Invitation[];
}
