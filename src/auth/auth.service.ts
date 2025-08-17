import { CreateUserDto } from '../user/dto/create-user.dto';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { loginDto } from './dto/login-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly UserService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async register(createUserDto: CreateUserDto) {
    const user = await this.UserService.create(createUserDto);

    // const token = await this.generateToken(user.id, user.email);

    return {
      message: 'User registered successfully',
      data: {
        user: {
          id: user.id,
          email: user.email,
          user_name: user.user_name,
        },
        // access_token: token,
      },
    };
  }

  async login(loginDto: loginDto) {
    const user = await this.UserService.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException(
        'Username OR password was wrong try again',
      );
    }

    console.log();
    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException(
        'Username OR password was wrong try again',
      );
    }

    const token = await this.generateToken(user.id, user.email);

    return {
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          user_name: user.user_name,
        },
        access_token: token,
      },
    };
  }

  private async generateToken(
    userId: number,
    userEmail: string,
  ): Promise<string> {
    return this.jwtService.signAsync(
      {
        sub: userId,
        userEmail,
      },
      {
        expiresIn: '1d',
        secret: process.env.JWT_SECRET,
      },
    );
  }
}
