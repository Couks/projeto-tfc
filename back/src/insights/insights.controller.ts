import { Controller, Get, Post, Query, UseGuards, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { InsightsService } from './insights.service';
import { InsightsQueryDto } from './dto/insights-query.dto';
import { RefreshMaterializedViewsDto } from './dto/refresh-materialized-views.dto';
import { UnifiedGuard } from '../common/guards/unified.guard';
import { RequireTenant } from '../common/decorators/require-tenant.decorator';
import { SiteKey } from '../common/decorators/site-key.decorator';
import { DevicesResponse } from './interfaces/insights.interface';
import {
  SearchAnalyticsResponse,
  FiltersUsageResponse,
  ConversionRateResponse,
  ConversionSourcesResponse,
  PopularPropertiesResponse,
  PropertyEngagementResponse,
} from './interfaces/categorized-insights.interface';
import { SearchAnalyzerService } from './analyzers/search-analyzer.service';
import { ConversionAnalyzerService } from './analyzers/conversion-analyzer.service';
import { PropertyAnalyzerService } from './analyzers/property-analyzer.service';

@ApiTags('Insights')
@Controller('insights')
@UseGuards(UnifiedGuard)
@RequireTenant()
export class InsightsController {
  constructor(
    private readonly insightsService: InsightsService,
    private readonly searchAnalyzer: SearchAnalyzerService,
    private readonly conversionAnalyzer: ConversionAnalyzerService,
    private readonly propertyAnalyzer: PropertyAnalyzerService,
  ) {}

  /**
   * Gets device analytics for a site
   * @param siteKey Site key from tenant guard
   * @param queryDto Query parameters
   * @returns Device data
   */
  @Get('devices')
  @ApiOperation({ summary: 'Get device analytics for a site' })
  @ApiResponse({ status: 200, description: 'Return device analytics.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getDevices(
    @SiteKey() siteKey: string,
    @Query() queryDto: InsightsQueryDto,
  ): Promise<DevicesResponse> {
    return this.insightsService.getDevices(siteKey, queryDto);
  }

  /**
   * Refreshes materialized views for a date range (admin only)
   * @param body Date range for refresh (optional, defaults to last 90 days)
   */
  @Post('admin/refresh')
  @ApiOperation({
    summary: 'Refresh materialized views for date range',
    description:
      'Refreshes all materialized views. If no date range provided, refreshes last 90 days.',
  })
  @ApiResponse({ status: 200, description: 'Materialized views refreshed.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async refreshMaterializedViews(@Body() body: RefreshMaterializedViewsDto) {
    // Default to last 90 days if not provided
    const now = new Date();
    const fromDate = body.fromDate
      ? new Date(body.fromDate)
      : new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    const toDate = body.toDate ? new Date(body.toDate) : now;

    await this.insightsService.refreshMaterializedViews(fromDate, toDate);

    return {
      success: true,
      message: `Materialized views refreshed from ${fromDate.toISOString()} to ${toDate.toISOString()}`,
      fromDate: fromDate.toISOString(),
      toDate: toDate.toISOString(),
    };
  }

  // =====================================================
  // SEARCH & FILTERS ANALYTICS
  // =====================================================

  /**
   * Gets search analytics
   * @param siteKey Site key from tenant guard
   * @param queryDto Query parameters
   * @returns Search analytics data
   */
  @Get('search/analytics')
  @ApiOperation({ summary: 'Get search analytics' })
  @ApiResponse({ status: 200, description: 'Return search analytics.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getSearchAnalytics(
    @SiteKey() siteKey: string,
    @Query() queryDto: InsightsQueryDto,
  ): Promise<SearchAnalyticsResponse> {
    return this.searchAnalyzer.getSearchAnalytics(siteKey, queryDto);
  }

  /**
   * Gets filters usage analytics
   * @param siteKey Site key from tenant guard
   * @param queryDto Query parameters
   * @returns Filters usage data
   */
  @Get('filters/usage')
  @ApiOperation({ summary: 'Get filters usage analytics' })
  @ApiResponse({ status: 200, description: 'Return filters usage analytics.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getFiltersUsage(
    @SiteKey() siteKey: string,
    @Query() queryDto: InsightsQueryDto,
  ): Promise<FiltersUsageResponse> {
    return this.searchAnalyzer.getFiltersUsage(siteKey, queryDto);
  }

  // =====================================================
  // CONVERSION ANALYTICS
  // =====================================================

  /**
   * Gets conversion rate analytics
   * @param siteKey Site key from tenant guard
   * @param queryDto Query parameters
   * @returns Conversion rate data
   */
  @Get('conversion/rate')
  @ApiOperation({ summary: 'Get conversion rate analytics' })
  @ApiResponse({ status: 200, description: 'Return conversion rate.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getConversionRate(
    @SiteKey() siteKey: string,
    @Query() queryDto: InsightsQueryDto,
  ): Promise<ConversionRateResponse> {
    return this.conversionAnalyzer.getConversionRate(siteKey, queryDto);
  }

  /**
   * Gets conversion sources analytics
   * @param siteKey Site key from tenant guard
   * @param queryDto Query parameters
   * @returns Conversion sources data
   */
  @Get('conversion/sources')
  @ApiOperation({ summary: 'Get conversion sources analytics' })
  @ApiResponse({ status: 200, description: 'Return conversion sources.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getConversionSources(
    @SiteKey() siteKey: string,
    @Query() queryDto: InsightsQueryDto,
  ): Promise<ConversionSourcesResponse> {
    return this.conversionAnalyzer.getConversionSources(siteKey, queryDto);
  }

  // =====================================================
  // PROPERTY ANALYTICS
  // =====================================================

  /**
   * Gets popular properties
   * @param siteKey Site key from tenant guard
   * @param queryDto Query parameters
   * @returns Popular properties data
   */
  @Get('properties/popular')
  @ApiOperation({ summary: 'Get popular properties' })
  @ApiResponse({ status: 200, description: 'Return popular properties.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getPopularProperties(
    @SiteKey() siteKey: string,
    @Query() queryDto: InsightsQueryDto,
  ): Promise<PopularPropertiesResponse> {
    return this.propertyAnalyzer.getPopularProperties(siteKey, queryDto);
  }

  /**
   * Gets property engagement analytics
   * @param siteKey Site key from tenant guard
   * @param queryDto Query parameters
   * @returns Property engagement data
   */
  @Get('properties/engagement')
  @ApiOperation({ summary: 'Get property engagement analytics' })
  @ApiResponse({
    status: 200,
    description: 'Return property engagement analytics.',
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getPropertyEngagement(
    @SiteKey() siteKey: string,
    @Query() queryDto: InsightsQueryDto,
  ): Promise<PropertyEngagementResponse> {
    return this.propertyAnalyzer.getPropertyEngagement(siteKey, queryDto);
  }
}
