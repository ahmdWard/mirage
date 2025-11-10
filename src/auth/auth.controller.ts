import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { User } from 'src/user/entities/user.entity';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { refreshTokensService } from './refresh-tokens.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { updatePasswordDto } from './dto/updating-password-dto';
import { ForgetPasswordDto } from './dto/forget-password-dto';

@Public()
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly refreshTokensService: refreshTokensService,
  ) {}

  @HttpCode(HttpStatus.CREATED)
  @Post('register')
  async register(@Body() CreateUserDto: CreateUserDto, @Req() req: Request) {
    const baseURL = `${req.protocol}://${req.get('host')}`;
    await this.authService.register(CreateUserDto, baseURL);
    return {
      status: 'success',
      message: 'Account registered successfully',
    };
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
      maxAge: 14 * 24 * 60 * 60 * 1000,
      path: '/auth/refresh',
    });
    return {
      status: 'success',
      message: 'Account logged In successfully',
      data: {
        result,
      },
    };
  }

  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const rawRefreshToken = req.cookies?.['refreshToken'] as string | undefined;
    if (!rawRefreshToken) {
      throw new UnauthorizedException('No refresh token');
    }
    const result = await this.refreshTokensService.validate(rawRefreshToken);
    if (!result) throw new UnauthorizedException('Invalid refresh token');

    const userId = result.userId;
    const { accessToken, refreshToken } = await this.authService.refreshTokens(
      userId,
      rawRefreshToken,
    );

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/auth/refresh',
      maxAge: 14 * 24 * 60 * 60 * 1000,
    });
    return {
      status: 'success',
      message: 'Access token refreshed successfully',
      data: {
        accessToken,
      },
    };
  }

  @HttpCode(HttpStatus.OK)
  @Post('forget-password')
  async forgetPassword(@Body() ForgetPasswordDto: ForgetPasswordDto, @Req() req: Request) {
    const baseURL = `${req.protocol}://${req.get('host')}`;

    await this.authService.forgetPassword(ForgetPasswordDto.email, baseURL);

    return {
      status: 'success',
      message: 'If an account exists with this email, a password reset link has been sent.',
    };
  }

  @HttpCode(HttpStatus.OK)
  @Post('reset-password/:token')
  async resetPassword(@Body() updatePasswordDto: updatePasswordDto, @Param('token') token: string) {
    await this.authService.resetPassword(updatePasswordDto, token);
    return {
      status: 'success',
      message: 'Password has been reset successfully',
    };
  }

  @HttpCode(HttpStatus.OK)
  @Get('verify/:token')
  async verifyAccount(@Param('token') token: string) {
    await this.authService.verifyAccount(token);
    return {
      status: 'success',
      message: 'Account verified  successfully',
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logOut(@Res({ passthrough: true }) res: Response) {
    res.cookie('refreshtoken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      expires: new Date(0),
    });
    return {
      status: 'success',
      message: 'Account logged out successfully ',
    };
  }
}
