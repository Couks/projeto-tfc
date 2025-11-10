import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UnifiedGuard } from '../../common/guards/unified.guard';
import { RequireTenant } from '../../common/decorators/require-tenant.decorator';
import { SiteKey } from '../../common/decorators/site-key.decorator';
import { InsightsQueryDto } from '../dto/insights-query.dto';
import {
  DevicesResponse,
  DevicesTimeSeriesResponse,
} from '../interfaces/insights.interface';
import { OverviewService } from './overview.service';

@ApiTags('Insights - Overview')
@Controller('insights/overview')
@UseGuards(UnifiedGuard)
@RequireTenant()
export class OverviewController {
  constructor(private readonly overviewService: OverviewService) {}

  @Get('devices')
  @ApiOperation({ summary: 'Get device analytics for a site' })
  @ApiResponse({ status: 200, description: 'Return device analytics.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getDevices(
    @SiteKey() siteKey: string,
    @Query() queryDto: InsightsQueryDto,
  ): Promise<DevicesResponse> {
    return this.overviewService.getDevices(siteKey, queryDto);
  }

  @Get('devices/timeseries')
  @ApiOperation({ summary: 'Get device analytics time series' })
  @ApiResponse({ status: 200, description: 'Return device time series.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getDevicesTimeSeries(
    @SiteKey() siteKey: string,
    @Query() queryDto: InsightsQueryDto,
  ): Promise<DevicesTimeSeriesResponse> {
    return await this.overviewService.getDevicesTimeSeries(siteKey, queryDto);
  }
}
