import { JwtService } from '@nestjs/jwt';
import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { User } from 'src/user/entities/user.entity';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { UserService } from '../user/user.service';
import { MailService } from '../mail/mail.service';
import { refreshTokensService } from './refresh-tokens.service';
import { payload } from './interfaces/payload.interface';
import { updatePassword } from './dto/updating-password-dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly UserService: UserService,
    private readonly jwtService: JwtService,
    private readonly MailService: MailService,
    private readonly refreshTokensService: refreshTokensService,
  ) {}

  async validateUserInService(email: string, password: string) {
    try {
      const user = await this.UserService.findByEmail(email);
      if (user && (await this.UserService.comparePassword(password, user.password))) {
        const { ...result } = user;
        return result;
      }
      return null;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async register(createUserDto: CreateUserDto) {
    const user = await this.UserService.create(createUserDto);
    return {
      message: 'User registered successfully',
      data: {
        user: {
          id: user.id,
          email: user.email,
          user_name: user.user_name,
        },
      },
    };
  }

  async login(user: User) {
    try {
      const payload: payload = {
        sub: user.id,
      };

      const accessToken = await this.generateTokens(payload);
      const { refreshToken } = await this.refreshTokensService.issue(user.id);
      return {
        message: 'Login successful',
        data: {
          user: {
            id: user.id,
            email: user.email,
            user_name: user.user_name,
          },
          accessToken,
        },
        refreshToken,
      };
    } catch (error) {
      console.log(error);
      throw new UnauthorizedException('Login failed');
    }
  }
  private async generateTokens(payload: payload): Promise<string> {
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.JWT_EXP,
    });
    return accessToken;
  }
  async refreshTokens(userId: number, rawRefreshToken: string) {
    const [tokenId] = rawRefreshToken.split('.');

    const valid = await this.refreshTokensService.validate(rawRefreshToken);

    if (!valid) throw new UnauthorizedException('Invalid or expired refresh token');

    await this.refreshTokensService.revoke(userId, tokenId);

    const payload: payload = {
      sub: userId,
    };
    const accessToken = await this.generateTokens(payload);

    const { refreshToken: newRefreshToken } = await this.refreshTokensService.issue(userId);

    return { accessToken, refreshToken: newRefreshToken };
  }

  async forgetPassword(email: string, baseUrl: string) {
    const user = await this.UserService.findByEmail(email);

    if (!user) {
      return;
    }
    const payload: payload = {
      sub: user.id,
    };
    const token = await this.generateTokens(payload);

    const resetURL = `${baseUrl}/auth/reset-password/${token}`;

    await this.MailService.sendPasswordResetEmail(user.email, resetURL);
  }

  async resetPassword(updatePassword: updatePassword, token: string) {
    if (updatePassword.password !== updatePassword.confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }
    try {
      const payload: payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });

      const userId = payload.sub;

      await this.UserService.updatePassword(
        updatePassword.password,
        updatePassword.confirmPassword,
        userId,
      );
    } catch (err) {
      console.log(err);
      throw new UnauthorizedException('Invalid or expired reset token');
    }
  }

  // private async verify
}
