import { Controller, Get, Post, Query, UseGuards, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { InsightsService } from './insights.service';
import { InsightsQueryDto } from './dto/insights-query.dto';
import { RefreshMaterializedViewsDto } from './dto/refresh-materialized-views.dto';
import { TenantGuard } from '../common/guards/tenant.guard';
import { SiteKey } from '../common/decorators/site-key.decorator';
import {
  OverviewResponse,
  TopEventsResponse,
  TopCitiesResponse,
  DevicesResponse,
} from './interfaces/insights.interface';
import {
  SearchAnalyticsResponse,
  FiltersUsageResponse,
  ConversionRateResponse,
  ConversionFunnelResponse,
  ConversionSourcesResponse,
  PopularPropertiesResponse,
  PropertyEngagementResponse,
  PropertyCTAPerformanceResponse,
  FormPerformanceResponse,
  FormAbandonmentResponse,
  BounceAnalyticsResponse,
  ScrollAnalyticsResponse,
} from './interfaces/categorized-insights.interface';
import { SearchAnalyzerService } from './analyzers/search-analyzer.service';
import { ConversionAnalyzerService } from './analyzers/conversion-analyzer.service';
import { PropertyAnalyzerService } from './analyzers/property-analyzer.service';
import { FormAnalyzerService } from './analyzers/form-analyzer.service';
import { EngagementAnalyzerService } from './analyzers/engagement-analyzer.service';

@ApiTags('Insights')
@Controller('insights')
@UseGuards(TenantGuard)
export class InsightsController {
  constructor(
    private readonly insightsService: InsightsService,
    private readonly searchAnalyzer: SearchAnalyzerService,
    private readonly conversionAnalyzer: ConversionAnalyzerService,
    private readonly propertyAnalyzer: PropertyAnalyzerService,
    private readonly formAnalyzer: FormAnalyzerService,
    private readonly engagementAnalyzer: EngagementAnalyzerService,
  ) {}

  /**
   * Gets overview analytics for a site
   * @param siteKey Site key from tenant guard
   * @param queryDto Query parameters
   * @returns Overview data
   */
  @Get('overview')
  @ApiOperation({ summary: 'Get overview analytics for a site' })
  @ApiResponse({ status: 200, description: 'Return overview analytics.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getOverview(
    @SiteKey() siteKey: string,
    @Query() queryDto: InsightsQueryDto,
  ): Promise<OverviewResponse> {
    return this.insightsService.getOverview(siteKey, queryDto);
  }

  /**
   * Gets top events for a site
   * @param siteKey Site key from tenant guard
   * @param queryDto Query parameters
   * @returns Top events data
   */
  @Get('top-events')
  @ApiOperation({ summary: 'Get top events for a site' })
  @ApiResponse({ status: 200, description: 'Return top events.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getTopEvents(
    @SiteKey() siteKey: string,
    @Query() queryDto: InsightsQueryDto,
  ): Promise<TopEventsResponse> {
    return this.insightsService.getTopEvents(siteKey, queryDto);
  }

  /**
   * Gets top cities for a site
   * @param siteKey Site key from tenant guard
   * @param queryDto Query parameters
   * @returns Top cities data
   */
  @Get('cities')
  @ApiOperation({ summary: 'Get top cities for a site' })
  @ApiResponse({ status: 200, description: 'Return top cities.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getTopCities(
    @SiteKey() siteKey: string,
    @Query() queryDto: InsightsQueryDto,
  ): Promise<TopCitiesResponse> {
    return this.insightsService.getTopCities(siteKey, queryDto);
  }

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
   * Gets conversion funnel analytics
   * @param siteKey Site key from tenant guard
   * @param queryDto Query parameters
   * @returns Conversion funnel data
   */
  @Get('conversion/funnel')
  @ApiOperation({ summary: 'Get conversion funnel analytics' })
  @ApiResponse({ status: 200, description: 'Return conversion funnel.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getConversionFunnel(
    @SiteKey() siteKey: string,
    @Query() queryDto: InsightsQueryDto,
  ): Promise<ConversionFunnelResponse> {
    return this.conversionAnalyzer.getConversionFunnel(siteKey, queryDto);
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

  /**
   * Gets property CTA performance analytics
   * @param siteKey Site key from tenant guard
   * @param queryDto Query parameters
   * @returns Property CTA performance data
   */
  @Get('properties/cta-performance')
  @ApiOperation({ summary: 'Get property CTA performance analytics' })
  @ApiResponse({
    status: 200,
    description: 'Return property CTA performance.',
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getCTAPerformance(
    @SiteKey() siteKey: string,
    @Query() queryDto: InsightsQueryDto,
  ): Promise<PropertyCTAPerformanceResponse> {
    return this.propertyAnalyzer.getCTAPerformance(siteKey, queryDto);
  }

  // =====================================================
  // FORM ANALYTICS
  // =====================================================

  /**
   * Gets form performance analytics
   * @param siteKey Site key from tenant guard
   * @param queryDto Query parameters
   * @returns Form performance data
   */
  @Get('forms/performance')
  @ApiOperation({ summary: 'Get form performance analytics' })
  @ApiResponse({ status: 200, description: 'Return form performance.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getFormPerformance(
    @SiteKey() siteKey: string,
    @Query() queryDto: InsightsQueryDto,
  ): Promise<FormPerformanceResponse> {
    return this.formAnalyzer.getFormPerformance(siteKey, queryDto);
  }

  /**
   * Gets form abandonment analytics
   * @param siteKey Site key from tenant guard
   * @param queryDto Query parameters
   * @returns Form abandonment data
   */
  @Get('forms/abandonment')
  @ApiOperation({ summary: 'Get form abandonment analytics' })
  @ApiResponse({ status: 200, description: 'Return form abandonment data.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getFormAbandonmentReasons(
    @SiteKey() siteKey: string,
    @Query() queryDto: InsightsQueryDto,
  ): Promise<FormAbandonmentResponse> {
    return this.formAnalyzer.getFormAbandonmentReasons(siteKey, queryDto);
  }

  // =====================================================
  // ENGAGEMENT & PERFORMANCE ANALYTICS
  // =====================================================

  /**
   * Gets bounce analytics
   * @param siteKey Site key from tenant guard
   * @param queryDto Query parameters
   * @returns Bounce analytics data
   */
  @Get('bounce/analytics')
  @ApiOperation({ summary: 'Get bounce analytics' })
  @ApiResponse({ status: 200, description: 'Return bounce analytics.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getBounceAnalytics(
    @SiteKey() siteKey: string,
    @Query() queryDto: InsightsQueryDto,
  ): Promise<BounceAnalyticsResponse> {
    return this.engagementAnalyzer.getBounceAnalytics(siteKey, queryDto);
  }

  /**
   * Gets scroll analytics
   * @param siteKey Site key from tenant guard
   * @param queryDto Query parameters
   * @returns Scroll analytics data
   */
  @Get('scroll/analytics')
  @ApiOperation({ summary: 'Get scroll analytics' })
  @ApiResponse({ status: 200, description: 'Return scroll analytics.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getScrollAnalytics(
    @SiteKey() siteKey: string,
    @Query() queryDto: InsightsQueryDto,
  ): Promise<ScrollAnalyticsResponse> {
    return this.engagementAnalyzer.getScrollAnalytics(siteKey, queryDto);
  }
}
