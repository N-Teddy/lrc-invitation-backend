import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
} from 'typeorm';
import { Region } from '../common/enums/region.enum';
import { AgeGroup } from '../common/enums/age-group.enum';
import { Attendance } from './attendance.entity';
import { Invitation } from './invitation.entity';

@Entity('children')
export class Child {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 255 })
    name: string;

    @Column({ type: 'date' })
    birthDate: Date;

    @Column({
        type: 'enum',
        enum: Region,
    })
    region: Region;

    @Column({ type: 'varchar', length: 255, nullable: true })
    parentName: string;

    @Column({ type: 'varchar', length: 50, nullable: true })
    parentContact: string;

    @CreateDateColumn({ type: 'timestamp' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updatedAt: Date;

    // Relations
    @OneToMany(() => Attendance, (attendance) => attendance.child)
    attendanceRecords: Attendance[];

    @OneToMany(() => Invitation, (invitation) => invitation.child)
    invitations: Invitation[];

    // Computed properties (not stored in DB)
    get age(): number {
        const today = new Date();
        const birthDate = new Date(this.birthDate);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();

        if (
            monthDiff < 0 ||
            (monthDiff === 0 && today.getDate() < birthDate.getDate())
        ) {
            age--;
        }

        return age;
    }

    get ageGroup(): AgeGroup {
        const age = this.age;
        if (age >= 5 && age <= 7) return AgeGroup.A;
        if (age >= 8 && age <= 11) return AgeGroup.B;
        if (age >= 12 && age <= 15) return AgeGroup.C;
        if (age >= 16 && age <= 18) return AgeGroup.D;
        return null;
    }
}
