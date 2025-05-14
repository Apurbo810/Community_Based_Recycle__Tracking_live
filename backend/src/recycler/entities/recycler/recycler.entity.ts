import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne } from 'typeorm';
import { MaterialLog } from './material.entity'; // Import MaterialLog entity
import { Payout } from './payout.entity'; // Import Payout entity
import { RecyclerEvent } from './recycler-event.entity'; // Import RecyclerEvent entity
import { MaterialLogHistory } from './material_log_histories.entity';
@Entity('recycler')
export class Recycler {
  static findOne(arg0: { where: { id: string; }; }) {
    throw new Error('Method not implemented.');
  }
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    password: string;

    @Column({type: 'varchar',length: 255,nullable: true})
    email: string | null; 

    @Column({
      type: 'enum',
      enum: ['male', 'female', 'other'],
      default: 'other',
    })
    gender: string
    
    @Column()
    age: number;

    @Column()
    earning: number;

    @Column({ type: 'float', default: 0 })
    unpaidEarnings: number;
  
    @Column({ type: 'float', default: 0 })
    unpaidBonuses: number;
  
    @Column('json', { default: {} })
    dailyEarnings: Record<string, number>;
  
    @Column({ type: 'varchar', nullable: true })
    lastBonusClaimed: string | null;
  
    @Column({ type: 'int', nullable: true })
    lastBonusTypeClaimed: number | null;

    @Column({ type: 'int', nullable: true })
    lastBonusAmount: number;

    @Column({ nullable: true })
    lastBonusClaimedType: number;

    @Column({ type: 'float', default: 0 })
    wallet: number;

    @Column({ default: 0 })
    acceptEvents: number;

    @Column({ default: 0 })
    rejectEvents: number;

    @Column({ type: 'float', nullable: true })
    weight: number;

    @CreateDateColumn()
    created_at: Date;

    @Column('json', { default: {} })
    dailyProgress: { [key: string]: { weight: number; acceptEvents: number; rejectEvents: number } };
    
    @UpdateDateColumn()
    updated_at: Date;
    
    @Column({
        type: 'enum',
        enum: ['Admin', 'recycler', 'Organization', 'Citizen'],
        default: 'recycler',
      })
      role: string; // Update this to a string

    @Column({ nullable: true }) // Make it nullable because it won't always be set
    twofaSecret?: string;
    

    @OneToMany(() => MaterialLog, (materialLog) => materialLog.recycler)
    materialLogs: MaterialLog[];

    @OneToMany(() => RecyclerEvent, (recyclerEvent) => recyclerEvent.recycler)
    recyclerEvents: RecyclerEvent[];

    @Column({ nullable: true })  // Make profilePicture optional
    profilePicture: string;
    
  @Column({ type: 'boolean', default: false })  // Add this field
  isActive: boolean;
  
  @OneToMany(() => MaterialLogHistory, (history) => history.recycler)
  materialLogHistories: MaterialLogHistory[];

  @Column({ type: 'json', nullable: true })
  payoutDetails: { method: 'mobile' | 'bank'; details: string } | null;

  @OneToMany(() => Payout, (payout) => payout.recycler)
  payouts: Payout[];

  @Column({ type: 'varchar', nullable: true })
  lastBonusMonth: string;  // Add this field

  @Column({ type: 'int', default: 1 }) // Default value of 1
  bonusStep: number;
}
