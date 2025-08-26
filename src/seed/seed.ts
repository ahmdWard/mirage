import { User } from '../user/entities/user.entity';
import { Server } from '../server/entities/server.entity';
import { Channel } from '../channel/entities/channel.entity';
import AppDataSource from '../config/typeorm.config';

async function seed() {
  const ds = await AppDataSource.initialize();

  const user = new User();
  user.user_name = 'demo';
  user.global_name = 'Demo User';
  user.email = 'demo@example.com';
  user.password = 'hashed-password';
  user.verifired = true;
  user.avatar = '';
  await ds.manager.save(user);

  const server = new Server();
  server.name = 'Demo Server';
  server.owner = user;
  server.members = [user];
  await ds.manager.save(server);

  const general = new Channel();
  general.name = 'general';
  general.type = 'text';
  general.server = server;

  const voice = new Channel();
  voice.name = 'General Voice';
  voice.type = 'voice';

  voice.server = server;

  await ds.manager.save([general, voice]);

  await ds.manager.save(server);

  console.log('✅ Seeding done!');
  await ds.destroy();
}

seed().catch((err) => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
