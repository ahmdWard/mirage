import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthenticatedRequest } from 'src/auth/interfaces/authenticated-request.interface';
import { Channel } from 'src/channel/entities/channel.entity';
import { Server } from 'src/server/entities/server.entity';

@Injectable()
export class membershiGuard implements CanActivate {
  constructor(
    @InjectRepository(Channel)
    private readonly channelRepo: Repository<Channel>,
    @InjectRepository(Server)
    private readonly serverRepo: Repository<Server>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const userId = req.user.userId;
    const channelId = Number(req.params.channelId);

    const channel = await this.channelRepo
      .createQueryBuilder('channel')
      .leftJoinAndSelect('channel.server', 'server')
      .leftJoinAndSelect('server.members', 'members')
      .where('channel.id = :channelId', { channelId })
      .getOne();

    if (!channel) throw new ForbiddenException('Channel not found');

    if (!channel.server.members.some((m) => m.id === userId)) {
      throw new ForbiddenException('You are not a member of this server');
    }
    return true;
  }
}
