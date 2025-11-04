import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { InsightsQueryDto } from '../dto/insights-query.dto';
import { DateFilter } from '../../events/dto/get-events.dto';
import {
  BounceAnalyticsResponse,
  ScrollAnalyticsResponse,
} from '../interfaces/categorized-insights.interface';

@Injectable()
export class EngagementAnalyzerService {
  private readonly logger = new Logger(EngagementAnalyzerService.name);

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
   * Gets bounce analytics
   */
  async getBounceAnalytics(
    siteKey: string,
    queryDto: InsightsQueryDto,
  ): Promise<BounceAnalyticsResponse> {
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

    // Get total bounces
    const totalResult = await this.prisma.$queryRaw<Array<{ total: bigint }>>`
      SELECT SUM(bounce_count) as total
      FROM mv_bounce_analytics_daily
      WHERE site_key = ${siteKey}
        AND bucket_date >= ${dateRange.start}
        AND bucket_date <= ${dateRange.end}
    `;

    const totalBounces = Number(totalResult[0]?.total || 0);

    // Get total sessions for bounce rate calculation
    const sessionsResult = await this.prisma.$queryRaw<
      Array<{ total: bigint }>
    >`
      SELECT SUM(sessions_count) as total
      FROM mv_events_overview_daily
      WHERE site_key = ${siteKey}
        AND bucket_date >= ${dateRange.start}
        AND bucket_date <= ${dateRange.end}
    `;

    const totalSessions = Number(sessionsResult[0]?.total || 0);

    const bounceRate =
      totalSessions > 0
        ? Math.round((totalBounces / totalSessions) * 100 * 100) / 100
        : 0;

    // Get bounces by type
    const bouncesByType = await this.prisma.$queryRaw<
      Array<{ bounce_type: string; count: bigint }>
    >`
      SELECT
        COALESCE(bounce_type, 'unknown') as bounce_type,
        SUM(bounce_count) as count
      FROM mv_bounce_analytics_daily
      WHERE site_key = ${siteKey}
        AND bucket_date >= ${dateRange.start}
        AND bucket_date <= ${dateRange.end}
      GROUP BY COALESCE(bounce_type, 'unknown')
      ORDER BY count DESC
    `;

    // Get top bounce pages
    const topBouncePages = await this.prisma.$queryRaw<
      Array<{ page_url: string; bounces: bigint }>
    >`
      SELECT
        page_url,
        SUM(bounce_count) as bounces
      FROM mv_bounce_analytics_daily
      WHERE site_key = ${siteKey}
        AND bucket_date >= ${dateRange.start}
        AND bucket_date <= ${dateRange.end}
        AND page_url IS NOT NULL
      GROUP BY page_url
      ORDER BY bounces DESC
      LIMIT ${queryDto.limit || 10}
    `;

    return {
      totalBounces,
      bounceRate,
      bouncesByType: bouncesByType.map((b) => ({
        type: b.bounce_type,
        count: Number(b.count),
        percentage:
          totalBounces > 0
            ? Math.round((Number(b.count) / totalBounces) * 100 * 100) / 100
            : 0,
      })),
      topBouncePages: topBouncePages.map((p) => {
        const bounces = Number(p.bounces);
        return {
          url: p.page_url,
          bounces,
          bounceRate:
            totalSessions > 0
              ? Math.round((bounces / totalSessions) * 100 * 100) / 100
              : 0,
        };
      }),
      period: {
        start: dateRange.start.toISOString(),
        end: dateRange.end.toISOString(),
      },
    };
  }

  /**
   * Gets scroll analytics
   */
  async getScrollAnalytics(
    siteKey: string,
    queryDto: InsightsQueryDto,
  ): Promise<ScrollAnalyticsResponse> {
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

    // Get average scroll depth
    const avgDepthResult = await this.prisma.$queryRaw<
      Array<{ avg_depth: number; total_scrolls: bigint }>
    >`
      SELECT
        AVG(scroll_depth) as avg_depth,
        SUM(depth_count) as total_scrolls
      FROM mv_scroll_analytics_daily
      WHERE site_key = ${siteKey}
        AND bucket_date >= ${dateRange.start}
        AND bucket_date <= ${dateRange.end}
    `;

    const avgScrollDepth = Math.round(avgDepthResult[0]?.avg_depth || 0);
    const totalScrollEvents = Number(avgDepthResult[0]?.total_scrolls || 0);

    // Get scroll distribution
    const scrollDistribution = await this.prisma.$queryRaw<
      Array<{ scroll_depth: number; count: bigint }>
    >`
      SELECT
        scroll_depth,
        SUM(depth_count) as count
      FROM mv_scroll_analytics_daily
      WHERE site_key = ${siteKey}
        AND bucket_date >= ${dateRange.start}
        AND bucket_date <= ${dateRange.end}
      GROUP BY scroll_depth
      ORDER BY scroll_depth ASC
    `;

    // Get top engaged pages (pages with deepest scrolls)
    const topEngagedPages = await this.prisma.$queryRaw<
      Array<{
        page_url: string;
        avg_depth: number;
        deep_scrolls: bigint;
      }>
    >`
      SELECT
        page_url,
        AVG(scroll_depth) as avg_depth,
        SUM(CASE WHEN scroll_depth >= 75 THEN depth_count ELSE 0 END) as deep_scrolls
      FROM mv_scroll_analytics_daily
      WHERE site_key = ${siteKey}
        AND bucket_date >= ${dateRange.start}
        AND bucket_date <= ${dateRange.end}
        AND page_url IS NOT NULL
      GROUP BY page_url
      ORDER BY avg_depth DESC
      LIMIT ${queryDto.limit || 10}
    `;

    return {
      avgScrollDepth,
      scrollDistribution: scrollDistribution.map((s) => ({
        depth: s.scroll_depth,
        count: Number(s.count),
        percentage:
          totalScrollEvents > 0
            ? Math.round((Number(s.count) / totalScrollEvents) * 100 * 100) /
              100
            : 0,
      })),
      topEngagedPages: topEngagedPages.map((p) => ({
        url: p.page_url,
        avgScrollDepth: Math.round(p.avg_depth),
        deepScrolls: Number(p.deep_scrolls),
      })),
      period: {
        start: dateRange.start.toISOString(),
        end: dateRange.end.toISOString(),
      },
    };
  }
}
