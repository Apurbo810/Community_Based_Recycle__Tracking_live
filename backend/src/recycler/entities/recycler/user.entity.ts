import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { IsEmail, IsEnum, IsString, Length, IsBoolean } from 'class-validator';
import { Event } from './event.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @IsString()
  @Length(3, 50, { message: 'Name must be between 3 and 50 characters' })
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  @IsEnum(['Admin', 'recycler', 'Organization', 'Citizen'], {
    message: 'Invalid role',
  })
  role: string;

  @Column()
  @IsString()
  password: string;

  @Column({ default: true })
  @IsBoolean({ message: 'isActive must be a boolean value' })
  isActive: boolean;

  @OneToMany(() => Event, event => event.createdBy)
  events: Event[];

}
