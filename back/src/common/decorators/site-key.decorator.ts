import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RequestWithAuthAndTenant } from '../guards/unified.guard';

/**
 * Decorator to extract site key from request
 * The UnifiedGuard with @RequireTenant() ensures tenant exists
 */
export const SiteKey = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest<RequestWithAuthAndTenant>();
    return request.tenant!.siteKey;
  },
);
