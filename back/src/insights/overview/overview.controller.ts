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
  @ApiOperation({
    summary: 'Obter analytics de dispositivos',
    description:
      'Retorna analytics de dispositivos (mobile, desktop, etc.) para um site.',
  })
  @ApiResponse({
    status: 200,
    description: 'Analytics de dispositivos retornados com sucesso.',
  })
  @ApiResponse({ status: 400, description: 'Requisição inválida.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  async getDevices(
    @SiteKey() siteKey: string,
    @Query() queryDto: InsightsQueryDto,
  ): Promise<DevicesResponse> {
    return this.overviewService.getDevices(siteKey, queryDto);
  }

  @Get('devices/timeseries')
  @ApiOperation({
    summary: 'Obter série temporal de dispositivos',
    description:
      'Retorna série temporal de analytics de dispositivos ao longo do tempo.',
  })
  @ApiResponse({
    status: 200,
    description: 'Série temporal de dispositivos retornada com sucesso.',
  })
  @ApiResponse({ status: 400, description: 'Requisição inválida.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  async getDevicesTimeSeries(
    @SiteKey() siteKey: string,
    @Query() queryDto: InsightsQueryDto,
  ): Promise<DevicesTimeSeriesResponse> {
    return await this.overviewService.getDevicesTimeSeries(siteKey, queryDto);
  }
}
