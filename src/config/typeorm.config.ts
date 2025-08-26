// src/data-source.ts
import { Channel } from 'src/channel/entities/channel.entity';
import { Server } from 'src/server/entities/server.entity';
import { User } from 'src/user/entities/user.entity';
import { DataSource } from 'typeorm';

export default new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: '10203040',
  database: 'mirage',
  entities: [__dirname + '/**/*.entity{.ts,.js}', User, Server, Channel],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  synchronize: true,
});
