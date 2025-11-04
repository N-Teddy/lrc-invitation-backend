import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
} from 'typeorm';

@Entity('system_configurations')
export class SystemConfiguration {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column({ unique: true })
	key: string;

	@Column()
	value: string;

	@Column({ nullable: true })
	description: string;

	@Column({ name: 'data_type', default: 'string' })
	dataType: string; // 'string', 'number', 'boolean'

	@CreateDateColumn({ name: 'created_at' })
	createdAt: Date;

	@UpdateDateColumn({ name: 'updated_at' })
	updatedAt: Date;
}
