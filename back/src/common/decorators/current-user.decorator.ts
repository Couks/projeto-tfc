import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RequestWithAuthAndTenant } from '../guards/unified.guard';

/**
 * Decorator to extract current user ID from request
 * The UnifiedGuard with @RequireAuth() ensures authSession exists
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest<RequestWithAuthAndTenant>();
    return request.authSession!.userId;
  },
);
