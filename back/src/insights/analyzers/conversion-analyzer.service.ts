import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { InsightsQueryDto } from '../dto/insights-query.dto';
import { DateFilter } from '../../events/dto/get-events.dto';
import {
  ConversionRateResponse,
  ConversionFunnelResponse,
  ConversionSourcesResponse,
} from '../interfaces/categorized-insights.interface';

@Injectable()
export class ConversionAnalyzerService {
  private readonly logger = new Logger(ConversionAnalyzerService.name);

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
   * Gets conversion rate analytics
   */
  async getConversionRate(
    siteKey: string,
    queryDto: InsightsQueryDto,
  ): Promise<ConversionRateResponse> {
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

    // Get total conversions
    const conversionsResult = await this.prisma.$queryRaw<
      Array<{ total: bigint }>
    >`
      SELECT SUM(conversion_count) as total
      FROM mv_conversion_analytics_daily
      WHERE site_key = ${siteKey}
        AND bucket_date >= ${dateRange.start}
        AND bucket_date <= ${dateRange.end}
    `;

    const totalConversions = Number(conversionsResult[0]?.total || 0);

    // Get total sessions
    const sessionsResult = await this.prisma.$queryRaw<
      Array<{ total: bigint }>
    >`
      SELECT SUM(unique_sessions) as total
      FROM mv_conversion_analytics_daily
      WHERE site_key = ${siteKey}
        AND bucket_date >= ${dateRange.start}
        AND bucket_date <= ${dateRange.end}
    `;

    const totalSessions = Number(sessionsResult[0]?.total || 0);

    // Get conversions by type
    const conversionsByTypeResult = await this.prisma.$queryRaw<
      Array<{ conversion_type: string | null; count: bigint }>
    >`
      SELECT
        conversion_type,
        SUM(conversion_count) as count
      FROM mv_conversion_analytics_daily
      WHERE site_key = ${siteKey}
        AND bucket_date >= ${dateRange.start}
        AND bucket_date <= ${dateRange.end}
        AND conversion_type IS NOT NULL
      GROUP BY conversion_type
      ORDER BY count DESC
    `;

    const conversionsByType = (conversionsByTypeResult || []).filter(
      (c) => c.conversion_type !== null,
    );

    const conversionRate =
      totalSessions > 0
        ? Math.round((totalConversions / totalSessions) * 100 * 100) / 100
        : 0;

    return {
      totalConversions,
      totalSessions,
      conversionRate,
      conversionsByType: conversionsByType.map((c) => ({
        type: c.conversion_type || 'unknown',
        count: Number(c.count || 0),
        percentage:
          totalConversions > 0
            ? Math.round(
                (Number(c.count || 0) / totalConversions) * 100 * 100,
              ) / 100
            : 0,
      })),
      period: {
        start: dateRange.start.toISOString(),
        end: dateRange.end.toISOString(),
      },
    };
  }

  /**
   * Gets conversion funnel analytics
   */
  async getConversionFunnel(
    siteKey: string,
    queryDto: InsightsQueryDto,
  ): Promise<ConversionFunnelResponse> {
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

    // Get funnel stages
    const stagesResult = await this.prisma.$queryRaw<
      Array<{ stage: string; count: bigint }>
    >`
      SELECT
        stage,
        SUM(sessions_count) as count
      FROM mv_conversion_funnel_daily
      WHERE site_key = ${siteKey}
        AND bucket_date >= ${dateRange.start}
        AND bucket_date <= ${dateRange.end}
        AND stage IS NOT NULL
      GROUP BY stage
      ORDER BY count DESC
    `;

    const stages = stagesResult || [];

    // Define stage order for funnel calculation
    const stageOrder = [
      'search_submitted',
      'viewed_property',
      'clicked_saber_mais',
      'clicked_fazer_proposta',
      'opened_contact_form',
      'submitted_contact_form',
      'conversion_confirmed',
    ];

    // Create a map of stage counts
    const stageMap = new Map(
      stages.map((s) => [s.stage, Number(s.count || 0)]),
    );

    // Calculate funnel metrics
    const totalStarted = stageMap.get('search_submitted') || 0;
    const totalCompleted = stageMap.get('conversion_confirmed') || 0;
    const overallConversionRate =
      totalStarted > 0
        ? Math.round((totalCompleted / totalStarted) * 100 * 100) / 100
        : 0;

    // Build stages with dropoff rates
    const funnelStages = stageOrder
      .map((stageName, index) => {
        const count = stageMap.get(stageName) || 0;
        const prevCount =
          index > 0 ? stageMap.get(stageOrder[index - 1]) || 0 : totalStarted;

        return {
          stage: stageName,
          count,
          percentage:
            totalStarted > 0
              ? Math.round((count / totalStarted) * 100 * 100) / 100
              : 0,
          dropoffRate:
            prevCount > 0
              ? Math.round(((prevCount - count) / prevCount) * 100 * 100) / 100
              : 0,
        };
      })
      .filter((s) => s.count > 0);

    // Always return at least empty stages array, not filtered
    return {
      stages: funnelStages.length > 0 ? funnelStages : [],
      totalStarted,
      totalCompleted,
      overallConversionRate,
      period: {
        start: dateRange.start.toISOString(),
        end: dateRange.end.toISOString(),
      },
    };
  }

  /**
   * Gets conversion sources analytics
   */
  async getConversionSources(
    siteKey: string,
    queryDto: InsightsQueryDto,
  ): Promise<ConversionSourcesResponse> {
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

    // Get conversion sources
    const sourcesResult = await this.prisma.$queryRaw<
      Array<{ source: string; count: bigint }>
    >`
      SELECT
        COALESCE(conversion_source, 'unknown') as source,
        SUM(conversion_count) as count
      FROM mv_conversion_analytics_daily
      WHERE site_key = ${siteKey}
        AND bucket_date >= ${dateRange.start}
        AND bucket_date <= ${dateRange.end}
      GROUP BY COALESCE(conversion_source, 'unknown')
      ORDER BY count DESC
      LIMIT ${queryDto.limit || 10}
    `;

    const sources = sourcesResult || [];
    const totalConversions = sources.reduce(
      (sum, s) => sum + Number(s.count || 0),
      0,
    );

    return {
      sources: sources.map((s) => ({
        source: s.source || 'unknown',
        conversions: Number(s.count || 0),
        percentage:
          totalConversions > 0
            ? Math.round(
                (Number(s.count || 0) / totalConversions) * 100 * 100,
              ) / 100
            : 0,
      })),
      period: {
        start: dateRange.start.toISOString(),
        end: dateRange.end.toISOString(),
      },
    };
  }
}
