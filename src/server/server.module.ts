import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { ServerService } from './server.service';
import { ServerController } from './server.controller';
import { Server } from './entities/server.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Server, User])],
  controllers: [ServerController],
  providers: [ServerService],
  exports: [ServerModule],
})
export class ServerModule {}
