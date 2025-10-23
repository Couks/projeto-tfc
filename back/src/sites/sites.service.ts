import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSiteDto } from './dto/create-site.dto';
import { UpdateSiteDto } from './dto/update-site.dto';
import { CreateDomainDto } from './dto/create-domain.dto';
import { generateSiteKey, isValidFqdn } from '../common/utils/site-key.utils';

@Injectable()
export class SitesService {
  private readonly logger = new Logger(SitesService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Creates a new site with initial domain
   * @param userId Owner user ID
   * @param createSiteDto Site creation data
   * @returns Created site
   */
  async create(userId: string, createSiteDto: CreateSiteDto) {
    const { name, domain } = createSiteDto;

    // Validate FQDN
    if (!isValidFqdn(domain)) {
      throw new BadRequestException('Invalid domain format');
    }

    // Check if domain already exists
    const existingDomain = await this.prisma.domain.findFirst({
      where: { host: domain },
    });

    if (existingDomain) {
      throw new ConflictException('Domain already registered');
    }

    // Generate unique site key
    const siteKey = generateSiteKey();

    // Create site with domain
    const site = await this.prisma.site.create({
      data: {
        userId,
        name,
        siteKey,
        domains: {
          create: {
            host: domain,
            isPrimary: true,
          },
        },
      },
      include: {
        domains: true,
        settings: true,
      },
    });

    this.logger.log(`Site created: ${site.id} for user: ${userId}`);

    return site;
  }

  /**
   * Retrieves all sites for a user
   * @param userId Owner user ID
   * @returns Array of sites
   */
  async findAll(userId: string) {
    return this.prisma.site.findMany({
      where: { userId },
      include: {
        domains: {
          select: {
            id: true,
            host: true,
            isPrimary: true,
          },
        },
        _count: {
          select: {
            settings: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Retrieves a single site by ID
   * @param id Site ID
   * @param userId Owner user ID
   * @returns Site data
   */
  async findOne(id: string, userId: string) {
    const site = await this.prisma.site.findUnique({
      where: { id },
      include: {
        domains: true,
        settings: true,
      },
    });

    if (!site) {
      throw new NotFoundException('Site not found');
    }

    // Check ownership
    if (site.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return site;
  }

  /**
   * Finds a site by site key
   * @param siteKey Site key
   * @returns Site data
   */
  async findBySiteKey(siteKey: string) {
    const site = await this.prisma.site.findUnique({
      where: { siteKey },
      include: {
        domains: {
          select: {
            host: true,
          },
        },
      },
    });

    if (!site) {
      throw new NotFoundException('Site not found');
    }

    return site;
  }

  /**
   * Updates a site
   * @param id Site ID
   * @param userId Owner user ID
   * @param updateSiteDto Update data
   * @returns Updated site
   */
  async update(id: string, userId: string, updateSiteDto: UpdateSiteDto) {
    // Verify ownership
    await this.findOne(id, userId);

    const site = await this.prisma.site.update({
      where: { id },
      data: updateSiteDto,
      include: {
        domains: true,
        settings: true,
      },
    });

    this.logger.log(`Site updated: ${id}`);

    return site;
  }

  /**
   * Deletes a site
   * @param id Site ID
   * @param userId Owner user ID
   */
  async remove(id: string, userId: string) {
    // Verify ownership
    await this.findOne(id, userId);

    await this.prisma.site.delete({
      where: { id },
    });

    this.logger.log(`Site deleted: ${id}`);
  }

  /**
   * Retrieves domains for a site
   * @param siteId Site ID
   * @param userId Owner user ID
   * @returns Array of domains
   */
  async getDomains(siteId: string, userId: string) {
    // Verify ownership
    await this.findOne(siteId, userId);

    return this.prisma.domain.findMany({
      where: { siteId },
      orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }],
    });
  }

  /**
   * Adds a domain to a site
   * @param siteId Site ID
   * @param userId Owner user ID
   * @param createDomainDto Domain data
   * @returns Created domain
   */
  async addDomain(
    siteId: string,
    userId: string,
    createDomainDto: CreateDomainDto,
  ) {
    const { host, isPrimary } = createDomainDto;

    // Verify ownership
    await this.findOne(siteId, userId);

    // Validate FQDN
    if (!isValidFqdn(host)) {
      throw new BadRequestException('Invalid domain format');
    }

    // Check if domain already exists
    const existingDomain = await this.prisma.domain.findFirst({
      where: {
        OR: [{ host }, { siteId, host }],
      },
    });

    if (existingDomain) {
      throw new ConflictException('Domain already registered');
    }

    // If setting as primary, unset other primary domains
    if (isPrimary) {
      await this.prisma.domain.updateMany({
        where: { siteId, isPrimary: true },
        data: { isPrimary: false },
      });
    }

    const domain = await this.prisma.domain.create({
      data: {
        siteId,
        host,
        isPrimary: isPrimary ?? false,
      },
    });

    this.logger.log(`Domain added: ${host} to site: ${siteId}`);

    return domain;
  }

  /**
   * Removes a domain from a site
   * @param siteId Site ID
   * @param domainId Domain ID
   * @param userId Owner user ID
   */
  async removeDomain(siteId: string, domainId: string, userId: string) {
    // Verify ownership
    await this.findOne(siteId, userId);

    const domain = await this.prisma.domain.findUnique({
      where: { id: domainId },
    });

    if (!domain || domain.siteId !== siteId) {
      throw new NotFoundException('Domain not found');
    }

    // Prevent deleting the last domain
    const domainCount = await this.prisma.domain.count({
      where: { siteId },
    });

    if (domainCount <= 1) {
      throw new BadRequestException('Cannot delete the last domain');
    }

    await this.prisma.domain.delete({
      where: { id: domainId },
    });

    this.logger.log(`Domain deleted: ${domainId} from site: ${siteId}`);
  }
}
