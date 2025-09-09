import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Server } from 'src/server/entities/server.entity';
import { ChannelService } from './channel.service';
import { ChannelController } from './channel.controller';
import { Channel } from './entities/channel.entity';
import { membershiGuard } from './guard/membership.guard';
import { ownerGuard } from './guard/ownership.guard';

@Module({
  imports: [TypeOrmModule.forFeature([Channel, Server])],
  controllers: [ChannelController],
  providers: [ChannelService, membershiGuard, ownerGuard],
  exports: [ChannelService],
})
export class ChannelModule {}
