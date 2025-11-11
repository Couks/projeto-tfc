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
   * Cria um novo site com domínio inicial
   * @param userId ID do usuário dono
   * @param createSiteDto Dados para criar o site
   * @returns Site criado
   */
  async create(userId: string, createSiteDto: CreateSiteDto) {
    const { name, domain } = createSiteDto;

    // Valida o FQDN do domínio
    if (!isValidFqdn(domain)) {
      throw new BadRequestException('Formato de domínio inválido');
    }

    // Verifica se o domínio já existe
    const existingDomain = await this.prisma.domain.findFirst({
      where: { host: domain },
    });

    if (existingDomain) {
      throw new ConflictException('Domínio já cadastrado');
    }

    // Gera chave única para o site
    const siteKey = generateSiteKey();

    // Cria o site com o domínio
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

    this.logger.log(`Site criado: ${site.id} para usuário: ${userId}`);

    return site;
  }

  /**
   * Busca todos os sites de um usuário
   * @param userId ID do usuário dono
   * @returns Array de sites
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
   * Busca um site pelo ID
   * @param id ID do site
   * @param userId ID do usuário dono
   * @returns Dados do site
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
      throw new NotFoundException('Site não encontrado');
    }

    // Verifica se pertence ao usuário
    if (site.userId !== userId) {
      throw new ForbiddenException('Acesso negado');
    }

    return site;
  }

  /**
   * Busca site pela chave do site
   * @param siteKey Chave do site
   * @returns Dados do site
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
      throw new NotFoundException('Site não encontrado');
    }

    return site;
  }

  /**
   * Atualiza um site
   * @param id ID do site
   * @param userId ID do usuário dono
   * @param updateSiteDto Dados de atualização
   * @returns Site atualizado
   */
  async update(id: string, userId: string, updateSiteDto: UpdateSiteDto) {
    // Verifica se pertence ao usuário
    await this.findOne(id, userId);

    const site = await this.prisma.site.update({
      where: { id },
      data: updateSiteDto,
      include: {
        domains: true,
        settings: true,
      },
    });

    this.logger.log(`Site atualizado: ${id}`);

    return site;
  }

  /**
   * Remove um site
   * @param id ID do site
   * @param userId ID do usuário dono
   */
  async remove(id: string, userId: string) {
    // Verifica se pertence ao usuário
    await this.findOne(id, userId);

    await this.prisma.site.delete({
      where: { id },
    });

    this.logger.log(`Site removido: ${id}`);
  }

  /**
   * Busca domínios de um site
   * @param siteId ID do site
   * @param userId ID do usuário dono
   * @returns Array de domínios
   */
  async getDomains(siteId: string, userId: string) {
    // Verifica se pertence ao usuário
    await this.findOne(siteId, userId);

    return this.prisma.domain.findMany({
      where: { siteId },
      orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }],
    });
  }

  /**
   * Adiciona um domínio ao site
   * @param siteId ID do site
   * @param userId ID do usuário dono
   * @param createDomainDto Dados do domínio
   * @returns Domínio criado
   */
  async addDomain(
    siteId: string,
    userId: string,
    createDomainDto: CreateDomainDto,
  ) {
    const { host, isPrimary } = createDomainDto;

    // Verifica se pertence ao usuário
    await this.findOne(siteId, userId);

    // Valida o FQDN do domínio
    if (!isValidFqdn(host)) {
      throw new BadRequestException('Formato de domínio inválido');
    }

    // Verifica se o domínio já existe
    const existingDomain = await this.prisma.domain.findFirst({
      where: {
        OR: [{ host }, { siteId, host }],
      },
    });

    if (existingDomain) {
      throw new ConflictException('Domínio já cadastrado');
    }

    // Se for primário, remove status primário de outros domínios
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

    this.logger.log(`Domínio adicionado: ${host} ao site: ${siteId}`);

    return domain;
  }

  /**
   * Remove um domínio do site
   * @param siteId ID do site
   * @param domainId ID do domínio
   * @param userId ID do usuário dono
   */
  async removeDomain(siteId: string, domainId: string, userId: string) {
    // Verifica se pertence ao usuário
    await this.findOne(siteId, userId);

    const domain = await this.prisma.domain.findUnique({
      where: { id: domainId },
    });

    if (!domain || domain.siteId !== siteId) {
      throw new NotFoundException('Domínio não encontrado');
    }

    // Não permite deletar o último domínio
    const domainCount = await this.prisma.domain.count({
      where: { siteId },
    });

    if (domainCount <= 1) {
      throw new BadRequestException('Não pode remover o último domínio');
    }

    await this.prisma.domain.delete({
      where: { id: domainId },
    });

    this.logger.log(`Domínio removido: ${domainId} do site: ${siteId}`);
  }
}
