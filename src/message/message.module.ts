import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Channel } from 'src/channel/entities/channel.entity';
import { Server } from 'src/server/entities/server.entity';
import { ChatModule } from 'src/chat/chat.module';
import { MessageService } from './message.service';
import { MessageGateway } from './message.gateway';
import { Message } from './entities/message.entity ';
import { MessageController } from './message.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Message, User, Channel, Server]),
    forwardRef(() => ChatModule),
  ],
  controllers: [MessageController],
  providers: [MessageGateway, MessageService],
  exports: [MessageService],
})
export class MessageModule {}
