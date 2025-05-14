import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Recycler } from './recycler.entity';

@Entity('payout')
export class Payout {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Recycler, (recycler) => recycler.payouts)
    recycler: Recycler;

    @Column({ type: 'enum', enum: ['mobile', 'bank'] })
    method: 'mobile' | 'bank';

    @Column({ type: 'varchar', nullable: true })
    mobileNumber: string | null;

    @Column({ type: 'varchar', nullable: true })
    bankAccount: string | null;

    @Column({ type: 'float' })
    amount: number;

    @Column({ type: 'enum', enum: ['pending', 'completed', 'failed'], default: 'pending' })
    status: 'pending' | 'completed' | 'failed';

    @CreateDateColumn()
    createdAt: Date;
}