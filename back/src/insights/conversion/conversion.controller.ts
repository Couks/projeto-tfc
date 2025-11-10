import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UnifiedGuard } from '../../common/guards/unified.guard';
import { RequireTenant } from '../../common/decorators/require-tenant.decorator';
import { SiteKey } from '../../common/decorators/site-key.decorator';
import { InsightsQueryDto } from '../dto/insights-query.dto';
import {
  ConversionRateResponse,
  ConversionSourcesResponse,
  LeadProfileResponse,
} from '../interfaces/categorized-insights.interface';
import { ConversionService } from './conversion.service';

@ApiTags('Insights - Conversion')
@Controller('insights/conversion')
@UseGuards(UnifiedGuard)
@RequireTenant()
export class ConversionController {
  constructor(private readonly conversionService: ConversionService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Get conversion rate analytics' })
  @ApiResponse({ status: 200, description: 'Return conversion rate.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getConversionRate(
    @SiteKey() siteKey: string,
    @Query() queryDto: InsightsQueryDto,
  ): Promise<ConversionRateResponse> {
    return this.conversionService.getConversionRate(siteKey, queryDto);
  }

  @Get('sources')
  @ApiOperation({ summary: 'Get conversion sources analytics' })
  @ApiResponse({ status: 200, description: 'Return conversion sources.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getConversionSources(
    @SiteKey() siteKey: string,
    @Query() queryDto: InsightsQueryDto,
  ): Promise<ConversionSourcesResponse> {
    return this.conversionService.getConversionSources(siteKey, queryDto);
  }

  @Get('lead-profile')
  @ApiOperation({ summary: 'Get an aggregated profile of converting leads' })
  @ApiResponse({ status: 200, description: 'Return lead profile data.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getLeadProfile(
    @SiteKey() siteKey: string,
    @Query() queryDto: InsightsQueryDto,
  ): Promise<LeadProfileResponse> {
    return this.conversionService.getLeadProfile(siteKey, queryDto);
  }
}
