import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateServerDto } from './dto/create-server.dto';
import { UpdateServerDto } from './dto/update-server.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Server } from './entities/server.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ServerService {
  constructor(
    @InjectRepository(Server)
    private readonly serverRepository: Repository<Server>,
  ) {}
  async create(createServerDto: CreateServerDto) {
    return await this.serverRepository.save(createServerDto);
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

  async update(id: number, updateServerDto: UpdateServerDto) {
    const server = await this.serverRepository.findOne({
      where: { id },
    });

    if (!server) throw new NotFoundException(`Server with ID ${id} not found`);

    Object.assign(server, updateServerDto);
    const updatedUser = await this.serverRepository.save(server);
    return {
      message: `Server with ID ${id} updated`,
      data: {
        updatedUser,
      },
    };
  }

  async remove(id: number) {
    const server = await this.serverRepository.findOne({
      where: { id },
    });

    if (!server) throw new NotFoundException(`Server with ID ${id} not found`);

    await this.serverRepository.remove(server);
    return {
      messgae: `Server with ID ${id} removed`,
    };
  }
}
