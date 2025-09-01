import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { DatabaseModule } from './config/databaseModule';
import { AuthModule } from './auth/auth.module';
import { ServerModule } from './server/server.module';
import { ChannelModule } from './channel/channel.module';
import { RedisModule } from './redis/redis.module';

@Module({
  imports: [
    UserModule,
    DatabaseModule,
    AuthModule,
    AuthModule,
    ServerModule,
    ChannelModule,
    RedisModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
