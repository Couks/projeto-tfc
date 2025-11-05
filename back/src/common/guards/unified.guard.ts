/**
 * UnifiedGuard - Guard Unificado de Autenticação e Multi-Tenancy
 *
 * Valida JWT do cookie e resolve siteId do header X-Site-Key quando aplicável.
 * Substitui AuthGuard e TenantGuard em um único guard flexível.
 *
 * Como funciona:
 * 1. Valida JWT do cookie 'admin_session' (se presente)
 * 2. Extrai e valida 'X-Site-Key' do header (se presente)
 * 3. Anexa authSession ao request quando JWT válido
 * 4. Anexa tenant ao request quando siteKey válido
 * 5. Suporta rotas que precisam só de auth, só de tenant, ou ambos
 *
 * Usado em:
 * - SitesController: Requer auth apenas
 * - EventsController: Requer tenant apenas
 * - InsightsController: Requer tenant apenas
 * - AuthController: Requer auth apenas (pode usar este guard também)
 *
 * Dependências:
 * - JwtService: Para validar tokens JWT
 * - PrismaService: Para buscar site e domínios no banco
 *
 * Segurança:
 * - JWT stateless (não requer sessão no servidor)
 * - Cookie HttpOnly (não acessível via JavaScript)
 * - SiteKey único e imprevisível (não pode ser forjado)
 * - Apenas sites ativos podem processar eventos
 */

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';

// Interfaces dos dados anexados ao request
export interface SessionData {
  userId: string;
}

export interface TenantInfo {
  siteKey: string;
  siteId: string;
  allowedDomains: string[];
}

// Interface unificada do request
// Extends Express Request with auth and tenant data
export interface RequestWithAuthAndTenant {
  cookies?: Record<string, string>;
  headers: Record<string, string | string[] | undefined>;
  query: Record<string, string | undefined>;
  ip?: string;
  authSession?: SessionData;
  tenant?: TenantInfo;
}

// Metadata keys para controlar requisitos
export const REQUIRE_AUTH_KEY = 'requireAuth';
export const REQUIRE_TENANT_KEY = 'requireTenant';

@Injectable()
export class UnifiedGuard implements CanActivate {
  private readonly logger = new Logger(UnifiedGuard.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly reflector: Reflector,
  ) {}

  /**
   * Valida JWT do cookie admin_session
   * @param token JWT token string
   * @returns SessionData se válido, null se inválido
   */
  private verifyJwt(token: string): SessionData | null {
    if (!token) return null;

    try {
      const payload = this.jwtService.verify<{ userId: string; sub: string }>(
        token,
      );

      // Valida que payload tem userId
      if (!payload?.userId || typeof payload.userId !== 'string') {
        return null;
      }

      return {
        userId: payload.userId,
      };
    } catch {
      // JWT inválido, expirado, ou assinatura incorreta
      return null;
    }
  }

  /**
   * Valida e resolve tenant do siteKey
   * @param siteKey Site key do header ou query
   * @returns TenantInfo se válido, null se inválido
   */
  private async resolveTenant(siteKey: string): Promise<TenantInfo | null> {
    if (!siteKey) return null;

    try {
      // Busca o site no banco de dados pelo siteKey
      const site = await this.prisma.site.findUnique({
        where: { siteKey },
        include: {
          domains: {
            select: { host: true },
          },
        },
      });

      if (!site) {
        this.logger.warn(`Invalid site key attempted: ${siteKey}`);
        return null;
      }

      // Verifica se o site está ativo
      if (site.status !== 'active') {
        this.logger.warn(`Inactive site accessed: ${siteKey}`);
        return null;
      }

      return {
        siteKey: site.siteKey,
        siteId: site.id,
        allowedDomains: site.domains.map((d) => d.host.toLowerCase()),
      };
    } catch {
      return null;
    }
  }

  /**
   * Método principal do guard
   * Valida JWT e/ou tenant conforme necessário
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<RequestWithAuthAndTenant>();

    // Verifica requisitos da rota via metadata
    const requireAuth = this.reflector.getAllAndOverride<boolean>(
      REQUIRE_AUTH_KEY,
      [context.getHandler(), context.getClass()],
    );

    const requireTenant = this.reflector.getAllAndOverride<boolean>(
      REQUIRE_TENANT_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Valida JWT se cookie presente ou se auth é requerido
    const cookies = request.cookies;
    const sessionCookie = cookies?.['admin_session'];

    if (sessionCookie || requireAuth) {
      if (!sessionCookie) {
        throw new UnauthorizedException('No session cookie found');
      }

      const session = this.verifyJwt(sessionCookie);

      if (!session) {
        this.logger.warn('Invalid JWT token');
        throw new UnauthorizedException('Invalid session');
      }

      request.authSession = session;
    }

    // Valida tenant se header presente ou se tenant é requerido
    const headerValue = request.headers['x-site-key'];
    const queryValue = request.query.site;

    let siteKey = '';
    if (typeof headerValue === 'string') {
      siteKey = headerValue;
    } else if (typeof queryValue === 'string') {
      siteKey = queryValue;
    }

    if (siteKey || requireTenant) {
      if (!siteKey) {
        throw new BadRequestException('Missing site key');
      }

      const tenant = await this.resolveTenant(siteKey);

      if (!tenant) {
        throw new ForbiddenException('Invalid or inactive site key');
      }

      request.tenant = tenant;
    }

    return true;
  }
}
