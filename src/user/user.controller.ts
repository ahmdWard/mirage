import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // @Post()
  // async create(@Body() createUserDto: CreateUserDto) {
  //   return await this.userService.create(createUserDto);
  // }

  @Get()
  async findAll(): Promise<User[]> {
    return await this.userService.findAll();
  }
  @Get(':id')
  async findOne(@Param('id', new ParseIntPipe()) id: number) {
    return await this.userService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', new ParseIntPipe())
    id: number,
    @Body()
    updateUserDto: UpdateUserDto,
  ) {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id', new ParseIntPipe()) id: number) {
    return this.userService.remove(id);
  }
}
