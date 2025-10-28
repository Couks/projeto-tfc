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
import { ApiTags } from '@nestjs/swagger';
import { SitesService } from './sites.service';
import { CreateSiteDto } from './dto/create-site.dto';
import { UpdateSiteDto } from './dto/update-site.dto';
import { CreateDomainDto } from './dto/create-domain.dto';
import { AuthGuard } from '../common/guards/auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Sites')
@Controller('sites')
@UseGuards(AuthGuard)
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
  async removeDomain(
    @Param('id') id: string,
    @Param('domainId') domainId: string,
    @CurrentUser() userId: string,
  ) {
    await this.sitesService.removeDomain(id, domainId, userId);
  }
}
