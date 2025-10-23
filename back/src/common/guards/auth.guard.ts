/**
 * AuthGuard - Guard de Autenticação
 *
 * Protege rotas que requerem usuário autenticado validando o cookie de sessão.
 *
 * Como funciona:
 * 1. Extrai cookie 'admin_session' da requisição
 * 2. Verifica assinatura HMAC-SHA256 do cookie
 * 3. Usa timingSafeEqual para evitar timing attacks
 * 4. Extrai userId da sessão decodificada
 * 5. Anexa authSession ao request para uso nos controllers
 *
 * Usado em:
 * - AuthController: /api/auth/me
 * - SitesController: Todos os endpoints (CRUD de sites)
 *
 * Dependências:
 * - ConfigService: Para obter auth.secret usado na assinatura HMAC
 * - crypto: Para verificação HMAC-SHA256
 *
 * Segurança:
 * - Cookie HttpOnly (não acessível via JavaScript)
 * - Assinatura HMAC-SHA256 (não pode ser forjado sem secret)
 * - Comparação constant-time (previne timing attacks)
 *
 * Formato do cookie:
 * Base64(JSON({userId})).HMAC-SHA256(data, secret)
 * Exemplo: eyJ1c2VySWQiOiJjbHguLi4ifQ.a1b2c3d4e5f6...
 */

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import type { Request } from 'express';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';

// Interface dos dados armazenados na sessão
export interface SessionData {
  userId: string;
}

// Interface do request com sessão anexada
export interface RequestWithAuthSession extends Request {
  authSession: SessionData;
}

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);
  private readonly authSecret: string;

  constructor(private readonly configService: ConfigService) {
    // Carrega o secret da configuração (variável de ambiente NEXTAUTH_SECRET)
    const secret = this.configService.get<string>('auth.secret');
    if (!secret) {
      // Secret é obrigatório - se não estiver configurado, app não inicia
      throw new Error('AUTH_SECRET is not configured or is empty');
    }
    this.authSecret = secret;
  }

  /**
   * Verifica e decodifica cookie de sessão assinado
   *
   * @param signed - Cookie no formato: dados.assinatura
   * @returns SessionData se válido, null se inválido
   *
   * Processo:
   * 1. Separa dados da assinatura (última ocorrência de '.')
   * 2. Gera nova assinatura dos dados usando o mesmo secret
   * 3. Compara assinaturas usando timingSafeEqual (constant-time)
   * 4. Se válido, decodifica JSON e retorna dados
   */
  private verifySignedCookie(signed: string): SessionData | null {
    if (!signed) return null;

    // Encontra o último '.' que separa dados da assinatura
    const lastDot = signed.lastIndexOf('.');
    if (lastDot <= 0) return null;

    // Separa dados (antes do .) e assinatura (depois do .)
    const raw = signed.slice(0, lastDot);
    const sig = signed.slice(lastDot + 1);

    // Gera assinatura HMAC-SHA256 dos dados usando o secret
    const check = crypto
      .createHmac('sha256', this.authSecret)
      .update(raw)
      .digest('hex');

    try {
      // Compara assinaturas usando constant-time comparison
      // Isso previne timing attacks onde atacante pode inferir
      // informações baseado no tempo de resposta
      const isValid = crypto.timingSafeEqual(
        Buffer.from(sig),
        Buffer.from(check),
      );

      if (!isValid) return null;

      // Se assinatura válida, decodifica o JSON
      const parsed = JSON.parse(raw) as SessionData;
      // Valida estrutura dos dados
      if (!parsed?.userId || typeof parsed.userId !== 'string') {
        return null;
      }

      return parsed;
    } catch {
      // Qualquer erro de parsing ou comparação retorna null
      return null;
    }
  }

  /**
   * Método principal do guard - executado antes de cada requisição
   * Retorna true se autorizado, lança UnauthorizedException se não
   */
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RequestWithAuthSession>();

    // Extrai o cookie de sessão da requisição
    const cookies = request.cookies as Record<string, string> | undefined;
    const sessionCookie = cookies?.['admin_session'];

    if (!sessionCookie) {
      throw new UnauthorizedException('No session cookie found');
    }

    // Verifica e decodifica o cookie
    const session = this.verifySignedCookie(sessionCookie);

    if (!session) {
      this.logger.warn('Invalid session cookie');
      throw new UnauthorizedException('Invalid session');
    }

    // Anexa a sessão ao request para uso nos controllers
    // Controllers podem acessar via @CurrentUser() decorator
    request.authSession = session;

    return true;
  }
}
