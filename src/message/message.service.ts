import { BadRequestException, forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { Channel } from 'src/channel/entities/channel.entity';
import { ChatGateway } from '../chat/chat.gateway';
import { Message } from './entities/message.entity ';
import { createMessageDto } from './dto/create-message.dto';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Channel)
    private readonly channelReposatory: Repository<Channel>,
    @Inject(forwardRef(() => ChatGateway))
    private readonly chatGateway: ChatGateway,
  ) {}

  async createMessage(channelId: number, authorId: number, dto: createMessageDto) {
    const channel = await this.channelReposatory.findOne({
      where: { id: channelId },
    });
    if (!channel) throw new BadRequestException('there is no chnnel');

    const author = await this.userRepository.findOne({ where: { id: authorId } });
    if (!author) {
      throw new BadRequestException('User not found');
    }

    const message = this.messageRepository.create({
      content: dto.content,
      channel,
      author,
    });
    const savedMessage = await this.messageRepository.save(message);
    try {
      this.chatGateway.server.to(`channel-${channelId}`).emit('message:new', {
        id: savedMessage.id,
        content: savedMessage.content,
        createdAt: savedMessage.createdAt,
        author: {
          id: savedMessage.author.id,
          user_name: savedMessage.author.user_name,
        },
      });
    } catch (error) {
      console.log(error);
    }
    return savedMessage;
  }

  async getMessages(channelId: number, limit = 50) {
    return this.messageRepository.find({
      where: { channel: { id: channelId } },
      relations: ['author'],
      order: { createdAt: 'ASC' },
      take: limit,
    });
  }
}
