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
  @ApiOperation({
    summary: 'Obter analytics de taxa de conversão',
    description: 'Retorna taxa de conversão geral e conversões por tipo.',
  })
  @ApiResponse({
    status: 200,
    description: 'Analytics de taxa de conversão retornados com sucesso.',
  })
  @ApiResponse({ status: 400, description: 'Requisição inválida.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  async getConversionRate(
    @SiteKey() siteKey: string,
    @Query() queryDto: InsightsQueryDto,
  ): Promise<ConversionRateResponse> {
    return this.conversionService.getConversionRate(siteKey, queryDto);
  }

  @Get('sources')
  @ApiOperation({
    summary: 'Obter analytics de fontes de conversão',
    description:
      'Retorna analytics sobre as fontes de conversão (WhatsApp, formulário, etc.).',
  })
  @ApiResponse({
    status: 200,
    description: 'Analytics de fontes de conversão retornados com sucesso.',
  })
  @ApiResponse({ status: 400, description: 'Requisição inválida.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  async getConversionSources(
    @SiteKey() siteKey: string,
    @Query() queryDto: InsightsQueryDto,
  ): Promise<ConversionSourcesResponse> {
    return this.conversionService.getConversionSources(siteKey, queryDto);
  }

  @Get('lead-profile')
  @ApiOperation({
    summary: 'Obter perfil agregado de leads que convertem',
    description:
      'Retorna perfil agregado dos leads que realizaram conversões, incluindo interesses, categorias e valores médios.',
  })
  @ApiResponse({
    status: 200,
    description: 'Dados do perfil de leads retornados com sucesso.',
  })
  @ApiResponse({ status: 400, description: 'Requisição inválida.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  async getLeadProfile(
    @SiteKey() siteKey: string,
    @Query() queryDto: InsightsQueryDto,
  ): Promise<LeadProfileResponse> {
    return this.conversionService.getLeadProfile(siteKey, queryDto);
  }
}
