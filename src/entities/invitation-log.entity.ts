import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { Activity } from './activity.entity';
import { Monitor } from './monitor.entity';

export enum DeliveryMethod {
    WHATSAPP = 'whatsapp',
    EMAIL = 'email',
}

export enum DeliveryStatus {
    SENT = 'sent',
    FAILED = 'failed',
    PENDING = 'pending',
}

@Entity('invitation_logs')
export class InvitationLog {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'int' })
    activityId: number;

    @Column({ type: 'int' })
    sentToMonitorId: number;

    @Column({
        type: 'varchar',
        length: 20,
    })
    deliveryMethod: DeliveryMethod;

    @CreateDateColumn({ type: 'timestamp' })
    sentAt: Date;

    @Column({
        type: 'varchar',
        length: 20,
    })
    status: DeliveryStatus;

    @Column({ type: 'text', nullable: true })
    errorMessage: string;

    @Column({ type: 'int', default: 0 })
    childrenCount: number;

    @Column({ type: 'text', nullable: true })
    messagePreview: string;

    // Relations
    @ManyToOne(() => Activity, (activity) => activity.invitationLogs, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'activityId' })
    activity: Activity;

    @ManyToOne(() => Monitor, (monitor) => monitor.invitationLogs)
    @JoinColumn({ name: 'sentToMonitorId' })
    sentToMonitor: Monitor;
}
