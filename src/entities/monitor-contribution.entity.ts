import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	ManyToOne,
	JoinColumn,
} from 'typeorm';
import { Monitor } from './monitor.entity';
import { PaymentStatus } from '../common/enums/payment-status.enum';

@Entity('monitor_contributions')
export class MonitorContribution {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column({ name: 'monitor_id' })
	monitorId: string;

	@ManyToOne(() => Monitor, (monitor) => monitor.contributions)
	@JoinColumn({ name: 'monitor_id' })
	monitor: Monitor;

	@Column({ type: 'int' })
	year: number;

	@Column({ name: 'amount_due', type: 'decimal', precision: 10, scale: 2 })
	amountDue: number;

	@Column({ name: 'amount_paid', type: 'decimal', precision: 10, scale: 2, default: 0 })
	amountPaid: number;

	@Column({
		name: 'payment_status',
		type: 'enum',
		enum: PaymentStatus,
		default: PaymentStatus.PENDING,
	})
	paymentStatus: PaymentStatus;

	@Column({ type: 'jsonb', nullable: true })
	installments: Array<{
		amount: number;
		date: Date;
		notes?: string;
	}>;

	@CreateDateColumn({ name: 'created_at' })
	createdAt: Date;

	@UpdateDateColumn({ name: 'updated_at' })
	updatedAt: Date;
}
