import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { InsightsQueryDto } from '../dto/insights-query.dto';
import { DateFilter } from '../../events/dto/get-events.dto';
import {
  PopularPropertiesResponse,
  PropertyEngagementResponse,
  PropertyCTAPerformanceResponse,
} from '../interfaces/categorized-insights.interface';

@Injectable()
export class PropertyAnalyzerService {
  private readonly logger = new Logger(PropertyAnalyzerService.name);

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
   * Gets popular properties analytics
   */
  async getPopularProperties(
    siteKey: string,
    queryDto: InsightsQueryDto,
  ): Promise<PopularPropertiesResponse> {
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

    // Get popular properties with engagement metrics
    const properties = await this.prisma.$queryRaw<
      Array<{
        property_code: string;
        views: bigint;
        favorites: bigint;
        proposta_clicks: bigint;
        alugar_clicks: bigint;
        info_clicks: bigint;
      }>
    >`
      SELECT
        property_code,
        SUM(views) as views,
        SUM(favorites) as favorites,
        SUM(proposta_clicks + alugar_clicks + info_clicks) as cta_clicks,
        SUM(proposta_clicks) as proposta_clicks,
        SUM(alugar_clicks) as alugar_clicks,
        SUM(info_clicks) as info_clicks
      FROM mv_property_analytics_daily
      WHERE site_key = ${siteKey}
        AND bucket_date >= ${dateRange.start}
        AND bucket_date <= ${dateRange.end}
        AND property_code IS NOT NULL
        AND property_code != ''
      GROUP BY property_code
      ORDER BY views DESC
      LIMIT ${queryDto.limit || 10}
    `;

    return {
      properties: properties.map((p) => {
        const views = Number(p.views);
        const favorites = Number(p.favorites);
        const ctaClicks =
          Number(p.proposta_clicks) +
          Number(p.alugar_clicks) +
          Number(p.info_clicks);

        // Calculate engagement score (weighted)
        const engagementScore = views * 1 + favorites * 3 + ctaClicks * 5;

        return {
          codigo: p.property_code,
          views,
          favorites,
          ctaClicks,
          engagementScore,
        };
      }),
      period: {
        start: dateRange.start.toISOString(),
        end: dateRange.end.toISOString(),
      },
    };
  }

  /**
   * Gets property engagement analytics
   */
  async getPropertyEngagement(
    siteKey: string,
    queryDto: InsightsQueryDto,
  ): Promise<PropertyEngagementResponse> {
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

    // Get overall property engagement metrics
    const engagement = await this.prisma.$queryRaw<
      Array<{
        total_views: bigint;
        total_favorites: bigint;
        total_shares: bigint;
        total_proposta: bigint;
        total_alugar: bigint;
        total_info: bigint;
      }>
    >`
      SELECT
        SUM(views) as total_views,
        SUM(favorites) as total_favorites,
        SUM(shares) as total_shares,
        SUM(proposta_clicks) as total_proposta,
        SUM(alugar_clicks) as total_alugar,
        SUM(info_clicks) as total_info
      FROM mv_property_analytics_daily
      WHERE site_key = ${siteKey}
        AND bucket_date >= ${dateRange.start}
        AND bucket_date <= ${dateRange.end}
    `;

    // Get average time on property page
    const avgTimeResult = await this.prisma.$queryRaw<
      Array<{ avg_time: number }>
    >`
      SELECT AVG(avg_time_on_page) as avg_time
      FROM mv_top_properties_daily
      WHERE site_key = ${siteKey}
        AND bucket_date >= ${dateRange.start}
        AND bucket_date <= ${dateRange.end}
    `;

    const data = engagement[0] || {
      total_views: BigInt(0),
      total_favorites: BigInt(0),
      total_shares: BigInt(0),
      total_proposta: BigInt(0),
      total_alugar: BigInt(0),
      total_info: BigInt(0),
    };

    return {
      totalViews: Number(data.total_views),
      totalFavorites: Number(data.total_favorites),
      totalShares: Number(data.total_shares),
      avgTimeOnProperty: Math.round(avgTimeResult[0]?.avg_time || 0),
      ctaPerformance: {
        fazerProposta: Number(data.total_proposta),
        alugarImovel: Number(data.total_alugar),
        maisInformacoes: Number(data.total_info),
      },
      period: {
        start: dateRange.start.toISOString(),
        end: dateRange.end.toISOString(),
      },
    };
  }

  /**
   * Gets property CTA performance analytics
   */
  async getCTAPerformance(
    siteKey: string,
    queryDto: InsightsQueryDto,
  ): Promise<PropertyCTAPerformanceResponse> {
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

    // Get CTA clicks
    const ctaData = await this.prisma.$queryRaw<
      Array<{
        total_views: bigint;
        total_proposta: bigint;
        total_alugar: bigint;
        total_info: bigint;
      }>
    >`
      SELECT
        SUM(views) as total_views,
        SUM(proposta_clicks) as total_proposta,
        SUM(alugar_clicks) as total_alugar,
        SUM(info_clicks) as total_info
      FROM mv_property_analytics_daily
      WHERE site_key = ${siteKey}
        AND bucket_date >= ${dateRange.start}
        AND bucket_date <= ${dateRange.end}
    `;

    const data = ctaData[0] || {
      total_views: BigInt(0),
      total_proposta: BigInt(0),
      total_alugar: BigInt(0),
      total_info: BigInt(0),
    };

    const totalViews = Number(data.total_views);

    const ctas = [
      {
        ctaType: 'fazer_proposta',
        clicks: Number(data.total_proposta),
      },
      {
        ctaType: 'alugar_imovel',
        clicks: Number(data.total_alugar),
      },
      {
        ctaType: 'mais_informacoes',
        clicks: Number(data.total_info),
      },
    ];

    return {
      ctas: ctas.map((cta) => ({
        ctaType: cta.ctaType,
        clicks: cta.clicks,
        conversionRate:
          totalViews > 0
            ? Math.round((cta.clicks / totalViews) * 100 * 100) / 100
            : 0,
      })),
      period: {
        start: dateRange.start.toISOString(),
        end: dateRange.end.toISOString(),
      },
    };
  }
}
