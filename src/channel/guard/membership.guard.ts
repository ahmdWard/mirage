import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Server } from 'src/server/entities/server.entity';
import { Repository } from 'typeorm';
import { AuthenticatedRequest } from 'src/auth/interfaces/authenticated-request.interface';

@Injectable()
export class membershiGuard implements CanActivate {
  constructor(
    @InjectRepository(Server)
    private readonly serverRepository: Repository<Server>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const userId = req.user.userId;
    const serverId = Number(req.query.serverId);
    const server = await this.serverRepository.findOne({
      where: { id: serverId },
      relations: ['members'],
    });
    if (!server || !server.members.some((m) => m.id === userId))
      throw new ForbiddenException('You are not a member of this server');

    return true;
  }
}
