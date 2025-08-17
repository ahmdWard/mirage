import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

interface AuthenticatedRequest extends Request {
  user?: any; // you can replace `any` with your JWT payload type
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 1) Public route short-circuit
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const req = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = this.extractBearer(req);
    if (!token) throw new UnauthorizedException('Unauthorized');

    try {
      const payload = await this.jwt.verifyAsync(token);
      req.user = payload;
      return true;
    } catch {
      throw new UnauthorizedException('Unauthorized');
    }
  }

  private extractBearer(req: Request): string | undefined {
    const auth = req.headers.authorization;
    if (!auth) return;
    const [type, token] = auth.split(' ');
    return type === 'Bearer' ? token : undefined;
  }
}
