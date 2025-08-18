import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToMany,
} from 'typeorm';
import { Server } from 'src/server/entities/server.entity';
@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_name: string;

  @Column()
  global_name: string;

  @Column()
  email: string;

  @Column({ select: false })
  password: string;

  @Column()
  verifired: boolean;

  @Column()
  avatar: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  modifiedAt: Date;

  @OneToMany(() => Server, (server) => server.owner)
  ownedServers: Server[];

  @ManyToMany(() => Server, (server) => server.members)
  memberServers: Server[];
}
