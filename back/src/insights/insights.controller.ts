import {
  Controller,
  Get,
  Query,
  UseGuards,
  Delete,
  Param,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { InsightsService } from './insights.service';
import { AuthGuard } from '../common/guards/auth.guard';

@ApiTags('Insights')
@Controller('insights')
@UseGuards(AuthGuard)
export class InsightsController {
  constructor(private readonly insightsService: InsightsService) {}

  /**
   * Gets overview analytics for a site
   * @param site Site key
   * @returns Overview data
   */
  @Get('overview')
  async getOverview(@Query('site') site: string) {
    return this.insightsService.getOverview(site);
  }

  /**
   * Gets conversion analytics for a site
   * @param site Site key
   * @returns Conversion data
   */
  @Get('conversions')
  async getConversions(@Query('site') site: string) {
    return this.insightsService.getConversions(site);
  }

  /**
   * Gets user journey analytics for a site
   * @param site Site key
   * @returns Journey data
   */
  @Get('journeys')
  async getJourneys(@Query('site') site: string) {
    return this.insightsService.getJourneys(site);
  }

  /**
   * Gets top cities analytics for a site
   * @param site Site key
   * @returns Top cities data
   */
  @Get('top-cidades')
  async getTopCities(@Query('site') site: string) {
    return this.insightsService.getTopCities(site);
  }

  /**
   * Clears cache for a specific site
   * @param siteKey Site key
   */
  @Delete('cache/:siteKey')
  clearCache(@Param('siteKey') siteKey: string) {
    this.insightsService.clearCache(siteKey);
    return { success: true, message: `Cache cleared for site: ${siteKey}` };
  }

  /**
   * Clears all cache
   */
  @Delete('cache')
  clearAllCache() {
    this.insightsService.clearCache();
    return { success: true, message: 'All cache cleared' };
  }
}
