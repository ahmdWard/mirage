import { Message } from 'src/message/entities/message.entity ';
import { Server } from 'src/server/entities/server.entity';
import { Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Entity, OneToMany } from 'typeorm';

@Entity('channel')
export class Channel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'enum', enum: ['voice', 'text'] })
  type: 'voice' | 'text';

  @ManyToOne(() => Server, (server) => server.serverChannels)
  @JoinColumn({ name: 'server_id' })
  server: Server;

  @OneToMany(() => Message, (message) => message.channel)
  messages: Message[];
}
