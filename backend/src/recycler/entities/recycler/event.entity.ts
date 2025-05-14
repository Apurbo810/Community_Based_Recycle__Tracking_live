import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { RecyclerEvent } from './recycler-event.entity';

@Entity('events')
export class Event {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', nullable: true })
  address: string | null;
  
  @Column({ type: 'float', nullable: true })
  weight: number;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;


  @OneToMany(() => RecyclerEvent, (recyclerEvent) => recyclerEvent.event)
  recyclerEvents: RecyclerEvent[]; 


  @ManyToOne(() => User, user => user.events)
  @JoinColumn({ name: 'createdById' })
  createdBy: User;

  @Column({ type: 'timestamp', nullable: true })
  startTime: Date | null;

}
