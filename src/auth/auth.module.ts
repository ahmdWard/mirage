import { Module, forwardRef } from '@nestjs/common';
import { UserModule } from 'src/user/user.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { refreshTokensService } from './refresh-tokens.service';

@Module({
  imports: [
    forwardRef(() => UserModule),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) =>
        Promise.resolve({
          secret: config.getOrThrow<string>('JWT_SECRET'),
          signOptions: { expiresIn: config.get<string>('JWT_ACCESS_EXPIRATION', '15m') },
        }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy, refreshTokensService],
  exports: [AuthService],
})
export class AuthModule {}
