import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RequestWithAuthSession } from '../guards/auth.guard';

/**
 * Decorator to extract current user ID from request
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest<RequestWithAuthSession>();
    return request.authSession?.userId;
  },
);
