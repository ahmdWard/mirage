import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';
import { CreateServerDto } from './dto/create-server.dto';
import { UpdateServerDto } from './dto/update-server.dto';
import { Server } from './entities/server.entity';
@Injectable()
export class ServerService {
  constructor(
    @InjectRepository(Server)
    private readonly serverRepository: Repository<Server>,
  ) {}

  async create(createServerDto: CreateServerDto, req: AuthenticatedRequest) {
    const server = this.serverRepository.create({
      ...createServerDto,
      ownerId: req.user.userId,
      members: [{ id: req.user.userId }],
    });

    const savedServer = await this.serverRepository.save(server);

    return {
      message: 'Server created successfully',
      data: {
        server: savedServer,
      },
    };
  }

  async findAll() {
    const servers = await this.serverRepository.find();
    return {
      message: 'Servers Retrived successfully',
      length: servers.length,
      data: {
        servers,
      },
    };
  }

  async findOne(id: number) {
    const server = await this.serverRepository.findOne({
      where: { id },
    });
    if (!server) throw new NotFoundException(`Server with ID ${id} not found`);

    return {
      message: 'Server with ID ${id} retrived successfully',
      data: {
        server,
      },
    };
  }

  async update(id: number, updateServerDto: UpdateServerDto, req: AuthenticatedRequest) {
    const server = await this.serverRepository.findOne({
      where: { id },
    });

    if (!server) throw new NotFoundException(`Server with ID ${id} not found`);
    if (server.ownerId !== req.user.userId) {
      throw new ForbiddenException('Only server owner can update the server');
    }
    Object.assign(server, updateServerDto);
    const updatedUser = await this.serverRepository.save(server);
    return {
      message: `Server with ID ${id} updated`,
      data: {
        updatedUser,
      },
    };
  }

  async remove(id: number, req: AuthenticatedRequest) {
    const server = await this.serverRepository.findOne({
      where: { id },
    });

    if (!server) throw new NotFoundException(`Server with ID ${id} not found`);
    if (server.ownerId !== req.user.userId) {
      throw new ForbiddenException('Only server owner can update the server');
    }
    await this.serverRepository.remove(server);
    return {
      messgae: `Server with ID ${id} removed`,
    };
  }
}
