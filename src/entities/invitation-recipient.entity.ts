import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
    Index,
} from 'typeorm';
import { Activity } from './activity.entity';
import { Monitor } from './monitor.entity';

@Entity('invitation_recipients')
@Index(['activityId', 'monitorId'], { unique: true })
export class InvitationRecipient {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'int' })
    activityId: number;

    @Column({ type: 'int' })
    monitorId: number;

    @Column({ type: 'boolean', default: true })
    shouldReceiveWhatsapp: boolean;

    @Column({ type: 'boolean', default: false })
    shouldReceiveEmail: boolean;

    @CreateDateColumn({ type: 'timestamp' })
    createdAt: Date;

    // Relations
    @ManyToOne(() => Activity, (activity) => activity.invitationRecipients, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'activityId' })
    activity: Activity;

    @ManyToOne(() => Monitor, (monitor) => monitor.invitationRecipients)
    @JoinColumn({ name: 'monitorId' })
    monitor: Monitor;
}
