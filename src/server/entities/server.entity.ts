import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';

import { User } from 'src/user/entities/user.entity';

@Entity('servers')
export class Server {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column()
  ownerId: number;

  @ManyToOne(() => User, (user) => user.ownedServers)
  @JoinColumn({ name: 'ownerId' })
  owner: User;
  @ManyToMany(() => User, (user) => user.memberServers)
  @JoinTable({
    name: 'server_members',
    joinColumn: { name: 'serverId' },
    inverseJoinColumn: { name: 'userId' },
  })
  members: User[];
}
