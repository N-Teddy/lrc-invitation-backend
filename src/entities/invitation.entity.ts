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
import { InvitationStatus } from '../common/enums/invitation-status.enum';

@Entity('invitations')
@Index(['childId', 'activityId'], { unique: true })
export class Invitation {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'int' })
    childId: number;

    @Column({ type: 'int' })
    activityId: number;

    @Column({ type: 'varchar', length: 100, unique: true })
    invitationCode: string;

    @Column({
        type: 'enum',
        enum: InvitationStatus,
        default: InvitationStatus.PENDING,
    })
    status: InvitationStatus;

    @Column({ type: 'timestamp', nullable: true })
    sentAt: Date;

    @Column({ type: 'timestamp', nullable: true })
    respondedAt: Date;

    @CreateDateColumn({ type: 'timestamp' })
    createdAt: Date;

    // Relations
    @ManyToOne(() => Child, (child) => child.invitations)
    @JoinColumn({ name: 'childId' })
    child: Child;

    @ManyToOne(() => Activity, (activity) => activity.invitations)
    @JoinColumn({ name: 'activityId' })
    activity: Activity;
}
