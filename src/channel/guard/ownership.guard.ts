import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Server } from 'src/server/entities/server.entity';
import { Repository } from 'typeorm';
import { AuthenticatedRequest } from 'src/auth/interfaces/authenticated-request.interface';
import { ServerDto } from '../interface/server.interface';

@Injectable()
export class ownerGuard implements CanActivate {
  constructor(
    @InjectRepository(Server)
    private readonly serverRepository: Repository<Server>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<AuthenticatedRequest & { query: ServerDto }>();
    const userId = req.user.userId;
    const serverId = (req.body as ServerDto).serverId || req.query.serverId;
    const server = await this.serverRepository.findOne({
      where: { id: serverId },
      select: ['ownerId'],
    });
    if (!server || server.ownerId !== userId)
      throw new ForbiddenException('You are not a member of this server');

    return true;
  }
}
