import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  ManyToMany,
  JoinTable,
  OneToMany,
} from 'typeorm';

import { User } from 'src/user/entities/user.entity';
import { Channel } from 'src/channel/entities/channel.entity';

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
    joinColumn: { name: 'server_id' },
    inverseJoinColumn: { name: 'user_id' },
  })
  members: User[];

  @OneToMany(() => Channel, (channel) => channel.server)
  serverChannels: Channel[];
}
