import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    try {
      const existingUser = await this.userRepository.findOne({
        where: { email: createUserDto.email },
      });
      if (existingUser)
        throw new ConflictException('User with this email already exists');
      if (createUserDto.password !== createUserDto.confirmPassword)
        throw new BadRequestException('Passwords do not match');

      const hashedPassword = await bcrypt.hash(createUserDto.password, 12);

      const user = this.userRepository.create({
        ...createUserDto,
        password: hashedPassword,
      });

      return await this.userRepository.save(user);
    } catch (err) {
      if (err.code === '23505') {
        throw new ConflictException('User with this email already exists');
      }
      throw err;
    }
  }

  findAll() {
    return `This action returns all user`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
