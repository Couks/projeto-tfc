import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { InsightsQueryDto } from '../dto/insights-query.dto';
import { DateFilter } from '../../events/dto/get-events.dto';
import {
  PopularPropertiesResponse,
  PropertyEngagementResponse,
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
      }>
    >`
      SELECT
        property_code,
        SUM(views) as views,
        SUM(favorites) as favorites
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

        // Calculate engagement score (weighted)
        const engagementScore = views * 1 + favorites * 3;

        return {
          codigo: p.property_code,
          views,
          favorites,
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
      }>
    >`
      SELECT
        SUM(views) as total_views,
        SUM(favorites) as total_favorites
      FROM mv_property_analytics_daily
      WHERE site_key = ${siteKey}
        AND bucket_date >= ${dateRange.start}
        AND bucket_date <= ${dateRange.end}
    `;

    const data = engagement[0] || {
      total_views: BigInt(0),
      total_favorites: BigInt(0),
    };

    return {
      totalViews: Number(data.total_views),
      totalFavorites: Number(data.total_favorites),
      period: {
        start: dateRange.start.toISOString(),
        end: dateRange.end.toISOString(),
      },
    };
  }
}
