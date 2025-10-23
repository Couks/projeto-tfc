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

export interface TenantInfo {
  siteKey: string;
  siteId: string;
  allowedDomains: string[];
}

export interface RequestWithTenant extends Request {
  tenant: TenantInfo;
}

@Injectable()
export class TenantGuard implements CanActivate {
  private readonly logger = new Logger(TenantGuard.name);

  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithTenant>();

    // Extract siteKey from header or query
    const headerValue = request.headers['x-site-key'];
    const queryValue = request.query.site;

    // Convert to string safely
    let siteKey = '';
    if (typeof headerValue === 'string') {
      siteKey = headerValue;
    } else if (typeof queryValue === 'string') {
      siteKey = queryValue;
    }

    if (!siteKey) {
      throw new BadRequestException('Missing site key');
    }

    // Find site by siteKey
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
      throw new ForbiddenException('Invalid site key');
    }

    // Check if site is active
    if (site.status !== 'active') {
      this.logger.warn(`Inactive site accessed: ${siteKey}`);
      throw new ForbiddenException('Site is not active');
    }

    // Attach tenant info to request
    request.tenant = {
      siteKey: site.siteKey,
      siteId: site.id,
      allowedDomains: site.domains.map((d) => d.host.toLowerCase()),
    };

    return true;
  }
}
