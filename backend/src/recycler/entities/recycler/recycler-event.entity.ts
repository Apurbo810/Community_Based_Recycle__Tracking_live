import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, CreateDateColumn } from 'typeorm';
import { Recycler } from './recycler.entity';
import { Event } from './event.entity';

export type EventAction = 'joined' | 'rejected' | 'canceled'; // Enum-like for actions

@Entity('recycler_events')
export class RecyclerEvent {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Recycler, (recycler) => recycler.recyclerEvents)
  recycler: Recycler;

  @ManyToOne(() => Event, (event) => event.recyclerEvents)
  event: Event;

  @Column({
    type: 'enum',
    enum: ['joined', 'rejected', 'canceled'],
    default: 'joined',
  })
  action: EventAction; // Track action like 'joined', 'rejected', 'canceled'

  @Column('jsonb', { nullable: true })
  additionalData: any;


  @CreateDateColumn()
  created_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  startTime: Date | null;
  
}
