import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Request,
  UseGuards,
} from '@nestjs/common';
import type { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';
import { JwtAuthGuard } from '../auth/guards/jwtAuth.guard';
import { ServerService } from './server.service';
import { CreateServerDto } from './dto/create-server.dto';
import { UpdateServerDto } from './dto/update-server.dto';
// import { Public } from 'src/auth/decorators/public.decorator';

@UseGuards(JwtAuthGuard)
@Controller('server')
export class ServerController {
  constructor(private readonly serverService: ServerService) {}

  @Post()
  create(@Body() createServerDto: CreateServerDto, @Request() req: AuthenticatedRequest) {
    return this.serverService.create(createServerDto, req);
  }

  @Get()
  findAll() {
    return this.serverService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', new ParseIntPipe()) id: number) {
    return this.serverService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', new ParseIntPipe()) id: number,
    @Body() updateServerDto: UpdateServerDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.serverService.update(id, updateServerDto, req);
  }

  @Delete(':id')
  remove(@Param('id', new ParseIntPipe()) id: number, @Request() req: AuthenticatedRequest) {
    return this.serverService.remove(id, req);
  }
}
