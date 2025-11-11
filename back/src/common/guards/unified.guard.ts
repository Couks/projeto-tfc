/**
 * Guard unificado para autenticação (JWT) e multi-tenancy (site)
 *
 * Valida o cookie com JWT e resolve o siteId pelo header X-Site-Key quando necessário.
 * Substitui os guards AuthGuard e TenantGuard em um só.
 *
 * Como funciona:
 * 1. Valida JWT do cookie 'admin_session' (se existir)
 * 2. Pega e valida o 'X-Site-Key' do header (se existir)
 * 3. Adiciona authSession no request se JWT for válido
 * 4. Adiciona tenant no request se siteKey for válido
 * 5. Funciona para rotas que precisam só de auth, só de tenant, ou dos dois
 *
 * Usado em:
 * - SitesController: precisa só de auth
 * - EventsController: precisa só de tenant
 * - OverviewController, SearchController, PropertyController, ConversionController: precisam só de tenant
 * - AuthController: pode usar esse guard também para só auth
 *
 * Depende de:
 * - JwtService: para validar JWT
 * - PrismaService: para buscar site no banco
 *
 * Segurança:
 * - JWT sem estado (não precisa de sessão no servidor)
 * - Cookie HttpOnly (não pode ser acessado no JS)
 * - SiteKey único e difícil de adivinhar
 * - Só sites ativos podem processar eventos
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

// Tipos dos dados anexados ao request
export interface SessionData {
  userId: string;
}

export interface TenantInfo {
  siteKey: string;
  siteId: string;
  allowedDomains: string[];
}

// Interface do request com auth e tenant
export interface RequestComAuthETenant {
  cookies?: Record<string, string>;
  headers: Record<string, string | string[] | undefined>;
  query: Record<string, string | undefined>;
  ip?: string;
  authSession?: SessionData;
  tenant?: TenantInfo;
}

// Metadados para requisitos por rota
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
   * Valida o JWT do cookie admin_session
   * @param token token JWT
   * @returns SessionData se ok, null se inválido
   */
  private verifyJwt(token: string): SessionData | null {
    if (!token) return null;

    try {
      const payload = this.jwtService.verify<{ userId: string; sub: string }>(
        token,
      );

      // Checa se existe userId no payload
      if (!payload?.userId || typeof payload.userId !== 'string') {
        return null;
      }

      return {
        userId: payload.userId,
      };
    } catch {
      // JWT inválido, expirado ou assinatura errada
      return null;
    }
  }

  /**
   * Valida e resolve tenant a partir do siteKey
   * @param siteKey chave do site pelo header ou query
   * @returns TenantInfo se ok, null se inválido
   */
  private async resolveTenant(siteKey: string): Promise<TenantInfo | null> {
    if (!siteKey) return null;

    try {
      // Busca o site pelo siteKey no banco
      const site = await this.prisma.site.findUnique({
        where: { siteKey },
        include: {
          domains: {
            select: { host: true },
          },
        },
      });

      if (!site) {
        this.logger.warn(`Site key inválido: ${siteKey}`);
        return null;
      }

      // Checa se o site está ativo
      if (site.status !== 'active') {
        this.logger.warn(`Site inativo tentou acessar: ${siteKey}`);
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
   * Método principal, faz a validação do JWT e do tenant conforme a rota pedir
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestComAuthETenant>();
    // Pega requisitos da rota
    const requireAuth = this.reflector.getAllAndOverride<boolean>(
      REQUIRE_AUTH_KEY,
      [context.getHandler(), context.getClass()],
    );
    const requireTenant = this.reflector.getAllAndOverride<boolean>(
      REQUIRE_TENANT_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Valida JWT se cookie estiver presente ou for obrigatório
    const cookies = request.cookies;
    const sessionCookie = cookies?.['admin_session'];

    if (sessionCookie || requireAuth) {
      if (!sessionCookie) {
        throw new UnauthorizedException('Sem cookie de sessão');
      }

      const session = this.verifyJwt(sessionCookie);

      if (!session) {
        this.logger.warn('JWT inválido');
        throw new UnauthorizedException('Sessão inválida');
      }

      request.authSession = session;
    }

    // Valida tenant se header ou query ou for obrigatório
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
        throw new BadRequestException('Faltando site key');
      }

      const tenant = await this.resolveTenant(siteKey);

      if (!tenant) {
        throw new ForbiddenException('Site key inválido ou site inativo');
      }

      request.tenant = tenant;
    }

    return true;
  }
}
