import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthenticatedRequest } from 'src/auth/interfaces/authenticated-request.interface';
import { Channel } from 'src/channel/entities/channel.entity';

@Injectable()
export class membershiGuard implements CanActivate {
  constructor(
    @InjectRepository(Channel)
    private readonly channelRepo: Repository<Channel>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const userId = req.user.userId;
    const channelId = Number(req.params.channelId);
    const channel = await this.channelRepo.findOne({
      where: { id: channelId },
      relations: ['server', 'server.members'],
    });
    if (!channel || !channel.server.members.some((m) => m.id === userId))
      throw new ForbiddenException('You are not a member of this server');

    return true;
  }
}
