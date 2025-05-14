import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, OneToMany } from 'typeorm';
import { Recycler } from './recycler.entity';
import { MaterialLogHistory } from './material_log_histories.entity';

export enum MaterialType {
  PLASTIC = 'plastic',
  PAPER = 'paper',
  METAL = 'metal',
  GLASS = 'glass',
  OTHER = 'other',
}

export enum AcceptStatus {
  PENDING = "pending",
  ACCEPTED = "accepted",
  REJECTED = "rejected",
}

@Entity('material_logs')
export class MaterialLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'float', nullable: true })
  weight: number;

  @Column({ type: 'enum', enum: MaterialType })
  materialType: MaterialType;

  @Column({ type: 'varchar', length: 255 })
  location: string;

  @Column({ type: 'float', nullable: true })
  price: number;

  @Column({
    type: "enum",
    enum: AcceptStatus,
    default: AcceptStatus.PENDING, // Set a default value
  })
  acceptStatus: AcceptStatus;


  @ManyToOne(() => Recycler, (recycler) => recycler.materialLogs)
  recycler: Recycler;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;



  @OneToMany(() => MaterialLogHistory, (history) => history.materialLog)
  history: MaterialLogHistory[];


}
