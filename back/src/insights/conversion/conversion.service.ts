import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { InsightsQueryDto } from '../dto/insights-query.dto';
import { DateFilter } from '../../events/dto/get-events.dto';
import {
  ConversionRateResponse,
  ConversionSourcesResponse,
  LeadProfileResponse,
} from '../interfaces/categorized-insights.interface';

@Injectable()
export class ConversionService {
  private readonly logger = new Logger(ConversionService.name);

  constructor(private readonly prisma: PrismaService) {}

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

  async getLeadProfile(
    siteKey: string,
    queryDto: InsightsQueryDto,
  ): Promise<LeadProfileResponse> {
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

    const interests = this.prisma.$queryRaw<
      Array<{ interest: string; count: bigint }>
    >`
      SELECT properties->>'interesse' as interest, COUNT(*) as count
      FROM "Event"
      WHERE "siteKey" = ${siteKey} AND name = 'thank_you_view' AND ts >= ${dateRange.start} AND ts <= ${dateRange.end} AND properties->>'interesse' IS NOT NULL
      GROUP BY interest ORDER BY count DESC LIMIT 5
    `;

    const categories = this.prisma.$queryRaw<
      Array<{ category: string; count: bigint }>
    >`
      SELECT properties->>'categoria' as category, COUNT(*) as count
      FROM "Event"
      WHERE "siteKey" = ${siteKey} AND name = 'thank_you_view' AND ts >= ${dateRange.start} AND ts <= ${dateRange.end} AND properties->>'categoria' IS NOT NULL
      GROUP BY category ORDER BY count DESC LIMIT 5
    `;

    const propertyTypes = this.prisma.$queryRaw<
      Array<{ type: string; count: bigint }>
    >`
      SELECT properties->>'tipo' as type, COUNT(*) as count
      FROM "Event"
      WHERE "siteKey" = ${siteKey} AND name = 'thank_you_view' AND ts >= ${dateRange.start} AND ts <= ${dateRange.end} AND properties->>'tipo' IS NOT NULL
      GROUP BY type ORDER BY count DESC LIMIT 5
    `;

    const cities = this.prisma.$queryRaw<
      Array<{ city: string; count: bigint }>
    >`
      SELECT properties->>'cidade' as city, COUNT(*) as count
      FROM "Event"
      WHERE "siteKey" = ${siteKey} AND name = 'thank_you_view' AND ts >= ${dateRange.start} AND ts <= ${dateRange.end} AND properties->>'cidade' IS NOT NULL
      GROUP BY city ORDER BY count DESC LIMIT 5
    `;

    const avgSale = this.prisma.$queryRaw<Array<{ avg_sale: number }>>`
      SELECT AVG((properties->>'valor_venda')::numeric) as avg_sale
      FROM "Event"
      WHERE "siteKey" = ${siteKey} AND name = 'thank_you_view' AND ts >= ${dateRange.start} AND ts <= ${dateRange.end} AND (properties->>'valor_venda')::numeric > 0
    `;

    const avgRental = this.prisma.$queryRaw<Array<{ avg_rental: number }>>`
      SELECT AVG((properties->>'valor_aluguel')::numeric) as avg_rental
      FROM "Event"
      WHERE "siteKey" = ${siteKey} AND name = 'thank_you_view' AND ts >= ${dateRange.start} AND ts <= ${dateRange.end} AND (properties->>'valor_aluguel')::numeric > 0
    `;

    const [
      topInterests,
      topCategories,
      topPropertyTypes,
      topCities,
      avgSaleValue,
      avgRentalValue,
    ] = await Promise.all([
      interests,
      categories,
      propertyTypes,
      cities,
      avgSale,
      avgRental,
    ]);

    return {
      topInterests: topInterests.map((i) => ({ ...i, count: Number(i.count) })),
      topCategories: topCategories.map((c) => ({
        ...c,
        count: Number(c.count),
      })),
      topPropertyTypes: topPropertyTypes.map((t) => ({
        ...t,
        count: Number(t.count),
      })),
      topCities: topCities.map((c) => ({ ...c, count: Number(c.count) })),
      averageSaleValue: Math.round(avgSaleValue[0]?.avg_sale || 0),
      averageRentalValue: Math.round(avgRentalValue[0]?.avg_rental || 0),
      period: {
        start: dateRange.start.toISOString(),
        end: dateRange.end.toISOString(),
      },
    };
  }
}
