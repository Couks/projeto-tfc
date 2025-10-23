import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RequestWithTenant } from '../guards/tenant.guard';

/**
 * Decorator to extract site key from request
 */
export const SiteKey = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest<RequestWithTenant>();
    return request.tenant?.siteKey;
  },
);
