import { createParamDecorator, ExecutionContext } from '@nestjs/common';
// Corrigido: use o tipo correto já exportado do unified.guard
import type { RequestComAuthETenant } from '../guards/unified.guard';

/**
 * Decorator para extrair o ID do usuário atual da requisição.
 * O UnifiedGuard com @RequireAuth() garante que authSession existe.
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    // Pega o request já tipado com auth e tenant
    const request = ctx.switchToHttp().getRequest<RequestComAuthETenant>();
    // Retorna o ID do usuário da sessão autenticada
    return request.authSession!.userId;
  },
);
