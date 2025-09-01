import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserService } from '../../user/user.service';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly UserService: UserService,
    private readonly ConfigService: ConfigService,
  ) {
    const jwtSecret = ConfigService.get<string>('jwt_Secret');
    if (!jwtSecret) {
      throw new Error('JWT_SECRET environment variable is not set');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }
  async validate(payload: JwtPayload) {
    console.log(`Validating JWT payload: ${JSON.stringify(payload)}`);
    const user = await this.UserService.findOne(payload.sub);
    return {
      userId: user.id,
      email: user.email,
    };
  }
}
