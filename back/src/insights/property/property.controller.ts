import { Controller, Get, Query, UseGuards, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UnifiedGuard } from '../../common/guards/unified.guard';
import { RequireTenant } from '../../common/decorators/require-tenant.decorator';
import { SiteKey } from '../../common/decorators/site-key.decorator';
import { InsightsQueryDto } from '../dto/insights-query.dto';
import {
  PopularPropertiesResponse,
  PropertyEngagementResponse,
  PropertyFunnelResponse,
} from '../interfaces/categorized-insights.interface';
import { PropertyService } from './property.service';

@ApiTags('Insights - Property')
@Controller('insights/properties')
@UseGuards(UnifiedGuard)
@RequireTenant()
export class PropertyController {
  constructor(private readonly propertyService: PropertyService) {}

  @Get('popular')
  @ApiOperation({ summary: 'Get popular properties' })
  @ApiResponse({ status: 200, description: 'Return popular properties.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getPopularProperties(
    @SiteKey() siteKey: string,
    @Query() queryDto: InsightsQueryDto,
  ): Promise<PopularPropertiesResponse> {
    return this.propertyService.getPopularProperties(siteKey, queryDto);
  }

  @Get('engagement')
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
    return this.propertyService.getPropertyEngagement(siteKey, queryDto);
  }

  @Get(':propertyCode/funnel')
  @ApiOperation({ summary: 'Get conversion funnel for a specific property' })
  @ApiResponse({ status: 200, description: 'Return property funnel data.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getPropertyFunnel(
    @SiteKey() siteKey: string,
    @Param('propertyCode') propertyCode: string,
    @Query() queryDto: InsightsQueryDto,
  ): Promise<PropertyFunnelResponse> {
    return this.propertyService.getPropertyFunnel(
      siteKey,
      propertyCode,
      queryDto,
    );
  }
}
