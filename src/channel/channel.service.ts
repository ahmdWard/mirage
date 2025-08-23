import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateChannelDto } from './dto/create-channel.dto';
import { UpdateChannelDto } from './dto/update-channel.dto';
import { Channel } from './entities/channel.entity';

@Injectable()
export class ChannelService {
  constructor(
    @InjectRepository(Channel)
    private readonly channelRepository: Repository<Channel>,
  ) {}
  async create(createChannelDto: CreateChannelDto) {
    const channel = this.channelRepository.create(createChannelDto);
    await this.channelRepository.save(channel);
    return {
      message: 'channel created successfully',
      data: {
        channel,
      },
    };
  }

  async findAll(serverId: number) {
    const channels = await this.channelRepository.find({
      where: {
        server: { id: serverId },
      },
    });
    return {
      message: 'channels retrieved succesfully',
      data: {
        channels,
      },
    };
  }

  async findOne(id: number, serverId: number) {
    const channel = await this.channelRepository.findOne({
      where: {
        server: { id: serverId },
        id,
      },
    });
    return {
      message: ' Data retrived successfully',
      data: {
        channel,
      },
    };
  }

  async update(id: number, serverId: number, updateChannelDto: UpdateChannelDto) {
    const channel = await this.channelRepository.findOne({
      where: { id, server: { id: serverId } },
    });

    if (!channel) {
      throw new NotFoundException(`Channel not found`);
    }

    Object.assign(channel, updateChannelDto);
    const updatedChannel = await this.channelRepository.save(channel);
    return {
      message: `Server with ID ${id} updated`,
      data: {
        updatedChannel,
      },
    };
  }

  async remove(id: number, serverId: number) {
    const channel = await this.channelRepository.findOne({
      where: { id, server: { id: serverId } },
    });
    if (!channel) throw new NotFoundException(`Chennel not found`);
    await this.channelRepository.remove(channel);
    return {
      mesage: `This action removes a #${id} channel`,
    };
  }
}
