import { WebSocketGateway, SubscribeMessage, MessageBody } from '@nestjs/websockets';
import { MessageService } from './message.service';

@WebSocketGateway(3004, {})
export class MessageGateway {
  constructor(private readonly MessageService: MessageService) {}

  @SubscribeMessage('events')
  handleEvent(@MessageBody() data: string): string {
    console.log(data);
    return data;
  }
}
