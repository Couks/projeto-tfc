import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RequestComAuthETenant } from '../guards/unified.guard';

/**
 * Decorator para extrair a siteKey do request
 * O UnifiedGuard com @RequireTenant() garante que o tenant exista
 */
export const SiteKey = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    // Pega o objeto request tipado
    const request = ctx.switchToHttp().getRequest<RequestComAuthETenant>();
    // Retorna a chave do site do tenant já validado
    return request.tenant!.siteKey;
  },
);
