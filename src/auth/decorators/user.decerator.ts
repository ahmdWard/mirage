import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthenticatedRequest } from 'src/auth/interfaces/authenticated-request.interface';

export const GetUser = createParamDecorator(
  (data: string | undefined, context: ExecutionContext) => {
    const req = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const userId = req.user.userId;

    if (!userId) {
      return null;
    }

    return userId;
  },
);
