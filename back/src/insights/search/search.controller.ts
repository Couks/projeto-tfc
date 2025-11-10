import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UnifiedGuard } from '../../common/guards/unified.guard';
import { RequireTenant } from '../../common/decorators/require-tenant.decorator';
import { SiteKey } from '../../common/decorators/site-key.decorator';
import { InsightsQueryDto } from '../dto/insights-query.dto';
import {
  SearchAnalyticsResponse,
  FiltersUsageResponse,
  TopConvertingFiltersResponse,
} from '../interfaces/categorized-insights.interface';
import { SearchService } from './search.service';

@ApiTags('Insights - Search')
@Controller('insights/search')
@UseGuards(UnifiedGuard)
@RequireTenant()
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Get search analytics summary' })
  @ApiResponse({ status: 200, description: 'Return search analytics.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getSearchAnalytics(
    @SiteKey() siteKey: string,
    @Query() queryDto: InsightsQueryDto,
  ): Promise<SearchAnalyticsResponse> {
    return this.searchService.getSearchAnalytics(siteKey, queryDto);
  }

  @Get('filters-usage')
  @ApiOperation({ summary: 'Get filters usage analytics' })
  @ApiResponse({ status: 200, description: 'Return filters usage analytics.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getFiltersUsage(
    @SiteKey() siteKey: string,
    @Query() queryDto: InsightsQueryDto,
  ): Promise<FiltersUsageResponse> {
    return this.searchService.getFiltersUsage(siteKey, queryDto);
  }

  @Get('top-converting-filters')
  @ApiOperation({
    summary: 'Get the top converting search filter combinations',
  })
  @ApiResponse({
    status: 200,
    description: 'Return top converting filter combinations.',
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getTopConvertingFilters(
    @SiteKey() siteKey: string,
    @Query() queryDto: InsightsQueryDto,
  ): Promise<TopConvertingFiltersResponse> {
    return this.searchService.getTopConvertingFilters(siteKey, queryDto);
  }
}
