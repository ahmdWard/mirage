import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
  // UnauthorizedException,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/user/entities/user.entity';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { refreshTokensService } from './refresh-tokens.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { updatePassword } from './dto/updating-password-dto';
@Public()
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly refreshTokensService: refreshTokensService,
    private readonly JwtService: JwtService,
  ) {}

  @Post('register')
  async register(@Body() CreateUserDto: CreateUserDto) {
    return this.authService.register(CreateUserDto);
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const { refreshToken, ...result } = await this.authService.login(req.user as User);
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 1000,
      path: '/auth/refresh',
    });
    return result;
  }

  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const rawRefreshToken = req.cookies?.['refreshToken'] as string | undefined;
    if (!rawRefreshToken) {
      throw new UnauthorizedException('No refresh token');
    }
    const result = await this.refreshTokensService.validate(rawRefreshToken);
    if (!result) throw new UnauthorizedException();

    const userId = result.userId;
    const { accessToken, refreshToken } = await this.authService.refreshTokens(
      userId,
      rawRefreshToken,
    );

    // replace cookie with new refresh token
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/auth/refresh',
      maxAge: 14 * 24 * 60 * 1000,
    });

    return { accessToken };
  }

  @Post('forget-password')
  async forgetPassword(@Body('eamil') email: string, @Req() req: Request) {
    const baseURL = `${req.protocol}://${req.get('host')}`;

    return this.authService.forgetPassword(email, baseURL);
  }

  @Post('reset-password/:token')
  async resetPassword(@Body() updatePassword: updatePassword, @Param('token') token: string) {
    return this.authService.resetPassword(updatePassword, token);
  }
}
