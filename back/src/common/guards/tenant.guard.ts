/**
 * TenantGuard - Guard de Multi-Tenancy
 *
 * Valida o siteKey e implementa isolamento de dados entre sites (multi-tenancy).
 *
 * Como funciona:
 * 1. Extrai siteKey do header 'X-Site-Key' OU query param 'site'
 * 2. Busca site no banco de dados pelo siteKey
 * 3. Verifica se site existe e está ativo (status = 'active')
 * 4. Carrega domínios permitidos do site
 * 5. Anexa informações do tenant ao request
 *
 * Usado em:
 * - EventsController: Para validar eventos vindos do SDK
 * - InsightsController: Para garantir acesso apenas aos dados corretos
 * - SdkController: Para servir configuração do site correto
 *
 * Dependências:
 * - PrismaService: Para buscar site e domínios no banco
 *
 * Multi-tenancy:
 * - Cada site tem siteKey único
 * - Eventos são filtrados por siteKey
 * - Insights são calculados apenas para o site específico
 * - Previne que um site acesse dados de outro
 *
 * Segurança:
 * - Apenas sites ativos podem processar eventos
 * - SiteKey não pode ser forjado (único e imprevisível)
 * - Domínios permitidos previnem uso não autorizado
 *
 * Formato de uso:
 * - Header: X-Site-Key: site_abc123xyz
 * - Query: ?site=site_abc123xyz
 */

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import type { Request } from 'express';
import { PrismaService } from '../../prisma/prisma.service';

// Interface das informações do tenant anexadas ao request
export interface TenantInfo {
  siteKey: string; // Chave única do site
  siteId: string; // ID do site no banco
  allowedDomains: string[]; // Lista de domínios autorizados
}

// Interface do request com tenant anexado
export interface RequestWithTenant extends Request {
  tenant: TenantInfo;
}

@Injectable()
export class TenantGuard implements CanActivate {
  private readonly logger = new Logger(TenantGuard.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Método principal do guard - validação de multi-tenancy
   * Retorna true se siteKey válido, lança exceção se inválido
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithTenant>();

    // Extrai siteKey do header 'X-Site-Key' (preferencial) ou query 'site'
    // Header é usado pelo SDK JavaScript
    // Query é usado em requests diretas do frontend
    const headerValue = request.headers['x-site-key'];
    const queryValue = request.query.site;

    // Converte para string de forma segura
    // Headers podem ser string[] em alguns casos
    let siteKey = '';
    if (typeof headerValue === 'string') {
      siteKey = headerValue;
    } else if (typeof queryValue === 'string') {
      siteKey = queryValue;
    }

    if (!siteKey) {
      throw new BadRequestException('Missing site key');
    }

    // Busca o site no banco de dados pelo siteKey
    // Inclui domínios para validação de origem (CORS manual)
    const site = await this.prisma.site.findUnique({
      where: { siteKey },
      include: {
        domains: {
          select: { host: true },
        },
      },
    });

    if (!site) {
      // Loga tentativa de acesso com siteKey inválido (possível ataque)
      this.logger.warn(`Invalid site key attempted: ${siteKey}`);
      throw new ForbiddenException('Invalid site key');
    }

    // Verifica se o site está ativo
    // Sites inativos/suspensos não podem processar eventos
    if (site.status !== 'active') {
      this.logger.warn(`Inactive site accessed: ${siteKey}`);
      throw new ForbiddenException('Site is not active');
    }

    // Anexa informações do tenant ao request
    // Controllers podem acessar via @SiteKey() decorator
    // Services usam tenant.siteKey para filtrar dados
    request.tenant = {
      siteKey: site.siteKey,
      siteId: site.id,
      allowedDomains: site.domains.map((d) => d.host.toLowerCase()), // Normaliza para lowercase
    };

    return true;
  }
}
