import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Recycler } from './recycler.entity';
import { MaterialLog } from './material.entity';

export enum AcceptStatus {
    PENDING = "pending",
    ACCEPTED = "accepted",
    REJECTED = "rejected",
  }

@Entity('material_log_histories')
export class MaterialLogHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => MaterialLog, (materialLog) => materialLog.history)
  materialLog: MaterialLog;

  @ManyToOne(() => Recycler, (recycler) => recycler.materialLogHistories)
  recycler: Recycler;

  @Column({
    type: "enum",
    enum: AcceptStatus,
    default: AcceptStatus.PENDING, // Set a default value
  })
  acceptStatus: AcceptStatus;

  @Column({ type: 'float', nullable: true })
  price: number;

  @Column({ type: 'float', nullable: true })
  unpaidEarnings: number;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
}
