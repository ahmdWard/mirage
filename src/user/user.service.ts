import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Body,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { email },
      select: ['id', 'user_name', 'email', 'password', 'verifired'],
    });
  }

  async create(@Body() CreateUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.findByEmail(CreateUserDto.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }
    if (CreateUserDto.password !== CreateUserDto.confirmPassword)
      throw new ConflictException('Password and Confim Password are not the same');
    const hashedPassword = await bcrypt.hash(CreateUserDto.password, 10);
    const user = this.userRepository.create({
      ...CreateUserDto,
      password: hashedPassword,
    });

    return await this.userRepository.save(user);
  }

  async findAll() {
    return await this.userRepository.find();
  }

  async findOne(id: number) {
    const user = await this.userRepository.findOne({
      where: { id },
    });
    if (!user) throw new NotFoundException(`User with ID ${id} not found`);
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) throw new NotFoundException(`User with ID ${id} not found`);

    if (updateUserDto.password) {
      if (updateUserDto.password !== updateUserDto.confirmPassword) {
        throw new BadRequestException('Passwords do not match');
      }
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    Object.assign(user, updateUserDto);
    return await this.userRepository.save(user);
  }

  async remove(id: number) {
    const result = await this.userRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }

  async comparePassword(candidatePassword: string, userpassord: string): Promise<boolean> {
    return await bcrypt.compare(candidatePassword, userpassord);
  }

  async updatePassword(newPassword: string, ConfirmPassword: string, id: number) {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) throw new NotFoundException(`User with ID ${id} not found`);

    if (newPassword !== ConfirmPassword) {
      throw new BadRequestException('Password is not matched');
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;

    await this.userRepository.save(user);
  }

  async verifyAccount(id: number) {
    const user = await this.userRepository.findOne({
      where: { id },
    });
    if (!user) throw new NotFoundException(`User with ID ${id} not found`);

    if (user.verifired) throw new ConflictException('you already verified your account');

    user.verifired = true;
    await this.userRepository.save(user);
  }
}
