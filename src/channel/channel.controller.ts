import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwtAuth.guard';
import { ChannelService } from './channel.service';
import { CreateChannelDto } from './dto/create-channel.dto';
import { UpdateChannelDto } from './dto/update-channel.dto';
import { membershiGuard } from './guard/membership.guard';
import { ownerGuard } from './guard/ownership.guard';

@UseGuards(JwtAuthGuard)
@Controller('channel')
export class ChannelController {
  constructor(private readonly channelService: ChannelService) {}

  @Post()
  @UseGuards(ownerGuard)
  create(@Body() createChannelDto: CreateChannelDto) {
    return this.channelService.create(createChannelDto);
  }

  @Get()
  @UseGuards(membershiGuard)
  findAll(@Query('serverId', ParseIntPipe) serverId: number) {
    return this.channelService.findAll(serverId);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Query('serverId', ParseIntPipe) serverId: number,
  ) {
    return this.channelService.findOne(id, serverId);
  }

  @Patch(':id')
  @UseGuards(ownerGuard)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Query('serverId', ParseIntPipe) serverId: number,
    @Body() updateChannelDto: UpdateChannelDto,
  ) {
    return this.channelService.update(id, serverId, updateChannelDto);
  }

  @Delete(':id')
  @UseGuards(ownerGuard)
  remove(@Param('id', ParseIntPipe) id: number, @Query('serverId', ParseIntPipe) serverId: number) {
    return this.channelService.remove(id, serverId);
  }
}
