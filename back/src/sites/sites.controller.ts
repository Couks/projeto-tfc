import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiNoContentResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { SitesService } from './sites.service';
import { CreateSiteDto } from './dto/create-site.dto';
import { UpdateSiteDto } from './dto/update-site.dto';
import { CreateDomainDto } from './dto/create-domain.dto';
import { UnifiedGuard } from '../common/guards/unified.guard';
import { RequireAuth } from '../common/decorators/require-auth.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Sites')
@Controller('sites')
@UseGuards(UnifiedGuard)
@RequireAuth()
export class SitesController {
  constructor(private readonly sitesService: SitesService) {}

  /**
   * Creates a new site
   * @param userId Current user ID
   * @param createSiteDto Site creation data
   * @returns Created site
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Criar novo site',
    description: 'Cria um novo site associado ao usuário autenticado.',
  })
  @ApiCookieAuth('session-auth')
  @ApiCreatedResponse({
    description: 'Site criado com sucesso',
  })
  @ApiBadRequestResponse({ description: 'Dados inválidos' })
  @ApiUnauthorizedResponse({ description: 'Não autenticado' })
  async create(
    @CurrentUser() userId: string,
    @Body() createSiteDto: CreateSiteDto,
  ) {
    return this.sitesService.create(userId, createSiteDto);
  }

  /**
   * Retrieves all sites for current user
   * @param userId Current user ID
   * @returns Array of sites
   */
  @Get()
  @ApiOperation({
    summary: 'Listar todos os sites',
    description: 'Retorna todos os sites do usuário autenticado.',
  })
  @ApiCookieAuth('session-auth')
  @ApiOkResponse({
    description: 'Lista de sites retornada com sucesso',
  })
  @ApiUnauthorizedResponse({ description: 'Não autenticado' })
  async findAll(@CurrentUser() userId: string) {
    return this.sitesService.findAll(userId);
  }

  /**
   * Retrieves a single site
   * @param id Site ID
   * @param userId Current user ID
   * @returns Site data
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Obter site por ID',
    description:
      'Retorna os dados de um site específico do usuário autenticado.',
  })
  @ApiCookieAuth('session-auth')
  @ApiOkResponse({
    description: 'Dados do site retornados com sucesso',
  })
  @ApiNotFoundResponse({ description: 'Site não encontrado' })
  @ApiUnauthorizedResponse({ description: 'Não autenticado' })
  async findOne(@Param('id') id: string, @CurrentUser() userId: string) {
    return this.sitesService.findOne(id, userId);
  }

  /**
   * Updates a site
   * @param id Site ID
   * @param userId Current user ID
   * @param updateSiteDto Update data
   * @returns Updated site
   */
  @Put(':id')
  @ApiOperation({
    summary: 'Atualizar site',
    description:
      'Atualiza os dados de um site específico do usuário autenticado.',
  })
  @ApiCookieAuth('session-auth')
  @ApiOkResponse({
    description: 'Site atualizado com sucesso',
  })
  @ApiNotFoundResponse({ description: 'Site não encontrado' })
  @ApiBadRequestResponse({ description: 'Dados inválidos' })
  @ApiUnauthorizedResponse({ description: 'Não autenticado' })
  async update(
    @Param('id') id: string,
    @CurrentUser() userId: string,
    @Body() updateSiteDto: UpdateSiteDto,
  ) {
    return this.sitesService.update(id, userId, updateSiteDto);
  }

  /**
   * Deletes a site
   * @param id Site ID
   * @param userId Current user ID
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Excluir site',
    description: 'Exclui um site específico do usuário autenticado.',
  })
  @ApiCookieAuth('session-auth')
  @ApiNoContentResponse({
    description: 'Site excluído com sucesso',
  })
  @ApiNotFoundResponse({ description: 'Site não encontrado' })
  @ApiUnauthorizedResponse({ description: 'Não autenticado' })
  async remove(@Param('id') id: string, @CurrentUser() userId: string) {
    await this.sitesService.remove(id, userId);
  }

  /**
   * Retrieves domains for a site
   * @param id Site ID
   * @param userId Current user ID
   * @returns Array of domains
   */
  @Get(':id/domains')
  @ApiOperation({
    summary: 'Listar domínios do site',
    description: 'Retorna todos os domínios associados a um site específico.',
  })
  @ApiCookieAuth('session-auth')
  @ApiOkResponse({
    description: 'Lista de domínios retornada com sucesso',
  })
  @ApiNotFoundResponse({ description: 'Site não encontrado' })
  @ApiUnauthorizedResponse({ description: 'Não autenticado' })
  async getDomains(@Param('id') id: string, @CurrentUser() userId: string) {
    return this.sitesService.getDomains(id, userId);
  }

  /**
   * Adds a domain to a site
   * @param id Site ID
   * @param userId Current user ID
   * @param createDomainDto Domain data
   * @returns Created domain
   */
  @Post(':id/domains')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Adicionar domínio ao site',
    description: 'Adiciona um novo domínio a um site específico.',
  })
  @ApiCookieAuth('session-auth')
  @ApiCreatedResponse({
    description: 'Domínio adicionado com sucesso',
  })
  @ApiNotFoundResponse({ description: 'Site não encontrado' })
  @ApiBadRequestResponse({ description: 'Dados inválidos' })
  @ApiUnauthorizedResponse({ description: 'Não autenticado' })
  async addDomain(
    @Param('id') id: string,
    @CurrentUser() userId: string,
    @Body() createDomainDto: CreateDomainDto,
  ) {
    return this.sitesService.addDomain(id, userId, createDomainDto);
  }

  /**
   * Removes a domain from a site
   * @param id Site ID
   * @param domainId Domain ID
   * @param userId Current user ID
   */
  @Delete(':id/domains/:domainId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Remover domínio do site',
    description: 'Remove um domínio específico de um site.',
  })
  @ApiCookieAuth('session-auth')
  @ApiNoContentResponse({
    description: 'Domínio removido com sucesso',
  })
  @ApiNotFoundResponse({ description: 'Site ou domínio não encontrado' })
  @ApiUnauthorizedResponse({ description: 'Não autenticado' })
  async removeDomain(
    @Param('id') id: string,
    @Param('domainId') domainId: string,
    @CurrentUser() userId: string,
  ) {
    await this.sitesService.removeDomain(id, domainId, userId);
  }
}
