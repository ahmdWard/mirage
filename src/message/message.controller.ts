import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { GetUser } from 'src/auth/decorators/user.decerator';
import { JwtAuthGuard } from 'src/auth/guards/jwtAuth.guard';
import { createMessageDto } from './dto/create-message.dto';
import { MessageService } from './message.service';

@Controller('channel/:channelId/messages')
@UseGuards(JwtAuthGuard)
export class MessageController {
  constructor(private readonly messagesService: MessageService) {}
  @Post()
  createMessage(
    @Param('channelId') channelId: number,
    @Body() dto: createMessageDto,
    @GetUser('id') userId: number,
  ) {
    return this.messagesService.createMessage(channelId, userId, dto);
  }

  @Get()
  getMessages(@Param('channelId') channelId: number, @Query('limit') limit = 50) {
    return this.messagesService.getMessages(channelId, Number(limit));
  }
}
