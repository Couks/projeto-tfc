import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { InsightsQueryDto } from '../dto/insights-query.dto';
import { DateFilter } from '../../events/dto/get-events.dto';
import {
  SearchAnalyticsResponse,
  FiltersUsageResponse,
} from '../interfaces/categorized-insights.interface';

@Injectable()
export class SearchAnalyzerService {
  private readonly logger = new Logger(SearchAnalyzerService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Gets date range based on filter type
   */
  private getDateRange(
    dateFilter?: DateFilter,
    startDate?: string,
    endDate?: string,
  ) {
    const now = new Date();

    if (dateFilter === DateFilter.CUSTOM && startDate && endDate) {
      return {
        start: new Date(startDate),
        end: new Date(endDate),
      };
    }

    if (dateFilter === DateFilter.DAY) {
      const start = new Date(now);
      start.setHours(0, 0, 0, 0);
      const end = new Date(now);
      end.setHours(23, 59, 59, 999);
      return { start, end };
    }

    if (dateFilter === DateFilter.WEEK) {
      const start = new Date(now);
      start.setDate(now.getDate() - now.getDay());
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
      return { start, end };
    }

    if (dateFilter === DateFilter.MONTH) {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0,
        23,
        59,
        59,
        999,
      );
      return { start, end };
    }

    if (dateFilter === DateFilter.YEAR) {
      const start = new Date(now.getFullYear(), 0, 1);
      const end = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
      return { start, end };
    }

    // Default: last 30 days
    const start = new Date(now);
    start.setDate(now.getDate() - 30);
    start.setHours(0, 0, 0, 0);
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }

  /**
   * Gets search analytics from materialized view
   */
  async getSearchAnalytics(
    siteKey: string,
    queryDto: InsightsQueryDto,
  ): Promise<SearchAnalyticsResponse> {
    // Verify site exists
    const site = await this.prisma.site.findUnique({
      where: { siteKey },
      select: { id: true },
    });

    if (!site) {
      throw new NotFoundException('Site not found');
    }

    const dateRange = this.getDateRange(
      queryDto.dateFilter,
      queryDto.startDate,
      queryDto.endDate,
    );

    // Get total searches
    const totalResult = await this.prisma.$queryRaw<Array<{ total: bigint }>>`
      SELECT SUM(total_searches) as total
      FROM mv_search_analytics_daily
      WHERE site_key = ${siteKey}
        AND bucket_date >= ${dateRange.start}
        AND bucket_date <= ${dateRange.end}
    `;

    const totalSearches = Number(totalResult[0]?.total || 0);

    // Get top finalidades
    const finalidades = await this.prisma.$queryRaw<
      Array<{ finalidade: string; count: bigint }>
    >`
      SELECT
        finalidade,
        SUM(search_count) as count
      FROM mv_search_analytics_daily
      WHERE site_key = ${siteKey}
        AND bucket_date >= ${dateRange.start}
        AND bucket_date <= ${dateRange.end}
        AND finalidade IS NOT NULL
      GROUP BY finalidade
      ORDER BY count DESC
      LIMIT ${queryDto.limit || 10}
    `;

    // Get top tipos from search_submit events
    const tipos = await this.prisma.$queryRaw<
      Array<{ tipo: string; count: bigint }>
    >`
      SELECT
        jsonb_array_elements_text(properties->'tipos') as tipo,
        COUNT(*) as count
      FROM "Event"
      WHERE "siteKey" = ${siteKey}
        AND name = 'search_submit'
        AND ts >= ${dateRange.start}
        AND ts <= ${dateRange.end}
        AND properties->'tipos' IS NOT NULL
      GROUP BY tipo
      ORDER BY count DESC
      LIMIT ${queryDto.limit || 10}
    `;

    // Get top cidades from search_submit events
    const cidades = await this.prisma.$queryRaw<
      Array<{ cidade: string; count: bigint }>
    >`
      SELECT
        jsonb_array_elements_text(properties->'cidades') as cidade,
        COUNT(*) as count
      FROM "Event"
      WHERE "siteKey" = ${siteKey}
        AND name = 'search_submit'
        AND ts >= ${dateRange.start}
        AND ts <= ${dateRange.end}
        AND properties->'cidades' IS NOT NULL
      GROUP BY cidade
      ORDER BY count DESC
      LIMIT ${queryDto.limit || 10}
    `;

    // Calculate average filters used per search
    const avgFiltersResult = await this.prisma.$queryRaw<
      Array<{ avg_filters: number }>
    >`
      SELECT AVG(journey_length::INTEGER) as avg_filters
      FROM "Event"
      WHERE "siteKey" = ${siteKey}
        AND name = 'search_submit'
        AND ts >= ${dateRange.start}
        AND ts <= ${dateRange.end}
        AND properties->>'journey_length' IS NOT NULL
    `;

    return {
      totalSearches,
      topFinalidades: finalidades.map((f) => ({
        finalidade: f.finalidade || 'unknown',
        count: Number(f.count),
      })),
      topTipos: tipos.map((t) => ({
        tipo: t.tipo,
        count: Number(t.count),
      })),
      topCidades: cidades.map((c) => ({
        cidade: c.cidade,
        count: Number(c.count),
      })),
      avgFiltersUsed: Math.round(avgFiltersResult[0]?.avg_filters || 0),
      period: {
        start: dateRange.start.toISOString(),
        end: dateRange.end.toISOString(),
      },
    };
  }

  /**
   * Gets filters usage analytics
   */
  async getFiltersUsage(
    siteKey: string,
    queryDto: InsightsQueryDto,
  ): Promise<FiltersUsageResponse> {
    // Verify site exists
    const site = await this.prisma.site.findUnique({
      where: { siteKey },
      select: { id: true },
    });

    if (!site) {
      throw new NotFoundException('Site not found');
    }

    const dateRange = this.getDateRange(
      queryDto.dateFilter,
      queryDto.startDate,
      queryDto.endDate,
    );

    // Get total filter changes
    const totalResult = await this.prisma.$queryRaw<Array<{ total: bigint }>>`
      SELECT SUM(usage_count) as total
      FROM mv_filters_usage_daily
      WHERE site_key = ${siteKey}
        AND bucket_date >= ${dateRange.start}
        AND bucket_date <= ${dateRange.end}
    `;

    const totalFilterChanges = Number(totalResult[0]?.total || 0);

    // Get filters by type
    const filtersByType = await this.prisma.$queryRaw<
      Array<{ filter_field: string; count: bigint }>
    >`
      SELECT
        COALESCE(filter_field, event_name) as filter_field,
        SUM(usage_count) as count
      FROM mv_filters_usage_daily
      WHERE site_key = ${siteKey}
        AND bucket_date >= ${dateRange.start}
        AND bucket_date <= ${dateRange.end}
      GROUP BY COALESCE(filter_field, event_name)
      ORDER BY count DESC
      LIMIT ${queryDto.limit || 10}
    `;

    // Calculate percentages
    const filtersWithPercentage = filtersByType.map((f) => ({
      filterType: f.filter_field || 'unknown',
      count: Number(f.count),
      percentage:
        totalFilterChanges > 0
          ? Math.round((Number(f.count) / totalFilterChanges) * 100 * 100) / 100
          : 0,
    }));

    return {
      totalFilterChanges,
      filtersByType: filtersWithPercentage,
      topFilterCombinations: [], // TODO: Implement combination logic if needed
      period: {
        start: dateRange.start.toISOString(),
        end: dateRange.end.toISOString(),
      },
    };
  }
}
