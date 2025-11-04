import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { ServerModule } from './server/server.module';
import { ChannelModule } from './channel/channel.module';
import { RedisModule } from './redis/redis.module';
import { typeOrmConfigFactory } from './config/typeorm.config';
import { ChatModule } from './chat/chat.module';
import { MessageModule } from './message/message.module';
import { MailModule } from './mail/mail.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    EventEmitterModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: typeOrmConfigFactory,
      inject: [ConfigService],
    }),

    UserModule,
    AuthModule,
    ServerModule,
    ChannelModule,
    RedisModule,
    ConfigModule,
    ChatModule,
    MessageModule,
    MailModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
