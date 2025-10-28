import { Controller, Get, Post, Query, UseGuards, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { InsightsService } from './insights.service';
import { InsightsQueryDto } from './dto/insights-query.dto';
import { TenantGuard } from '../common/guards/tenant.guard';
import { SiteKey } from '../common/decorators/site-key.decorator';
import {
  OverviewResponse,
  TopEventsResponse,
  TopCitiesResponse,
  DevicesResponse,
} from './interfaces/insights.interface';

@ApiTags('Insights')
@Controller('insights')
@UseGuards(TenantGuard)
export class InsightsController {
  constructor(private readonly insightsService: InsightsService) {}

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
   * @param body Date range for refresh
   */
  @Post('admin/refresh')
  @ApiOperation({ summary: 'Refresh materialized views for date range' })
  @ApiResponse({ status: 200, description: 'Materialized views refreshed.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async refreshMaterializedViews(
    @Body() body: { fromDate: string; toDate: string },
  ) {
    const fromDate = new Date(body.fromDate);
    const toDate = new Date(body.toDate);

    await this.insightsService.refreshMaterializedViews(fromDate, toDate);

    return {
      success: true,
      message: `Materialized views refreshed from ${fromDate.toISOString()} to ${toDate.toISOString()}`,
    };
  }
}
