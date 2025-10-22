import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
} from 'typeorm';
import { Role } from '../common/enums/role.enum';
import { Region } from '../common/enums/region.enum';
import { Activity } from './activity.entity';
import { Attendance } from './attendance.entity';

@Entity('monitors')
export class Monitor {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 255 })
    name: string;

    @Column({ type: 'varchar', length: 255, unique: true })
    email: string;

    @Column({ type: 'varchar', length: 255 })
    passwordHash: string;

    @Column({ type: 'varchar', length: 50, nullable: true })
    phoneNumber: string;

    @Column({
        type: 'enum',
        enum: Role,
        default: Role.MONITOR,
    })
    role: Role;

    @Column({
        type: 'enum',
        enum: Region,
    })
    assignedTown: Region;

    @Column({ type: 'boolean', default: false })
    yearlyFeePaid: boolean;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    yearlyFeeAmount: number;

    @CreateDateColumn({ type: 'timestamp' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updatedAt: Date;

    // Relations
    @OneToMany(() => Attendance, (attendance) => attendance.monitor)
    attendanceRecords: Attendance[];
}
