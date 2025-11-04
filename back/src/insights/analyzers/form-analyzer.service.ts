import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { InsightsQueryDto } from '../dto/insights-query.dto';
import { DateFilter } from '../../events/dto/get-events.dto';
import {
  FormPerformanceResponse,
  FormAbandonmentResponse,
} from '../interfaces/categorized-insights.interface';

@Injectable()
export class FormAnalyzerService {
  private readonly logger = new Logger(FormAnalyzerService.name);

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
   * Gets form performance analytics
   */
  async getFormPerformance(
    siteKey: string,
    queryDto: InsightsQueryDto,
  ): Promise<FormPerformanceResponse> {
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

    // Get form metrics
    const formMetrics = await this.prisma.$queryRaw<
      Array<{
        total_started: bigint;
        total_submitted: bigint;
        total_abandoned: bigint;
      }>
    >`
      SELECT
        SUM(forms_started) as total_started,
        SUM(forms_submitted) as total_submitted,
        SUM(forms_abandoned) as total_abandoned
      FROM mv_form_analytics_daily
      WHERE site_key = ${siteKey}
        AND bucket_date >= ${dateRange.start}
        AND bucket_date <= ${dateRange.end}
    `;

    const data = formMetrics[0] || {
      total_started: BigInt(0),
      total_submitted: BigInt(0),
      total_abandoned: BigInt(0),
    };

    const totalStarts = Number(data.total_started);
    const totalSubmits = Number(data.total_submitted);
    const totalAbandons = Number(data.total_abandoned);

    const completionRate =
      totalStarts > 0
        ? Math.round((totalSubmits / totalStarts) * 100 * 100) / 100
        : 0;

    const abandonmentRate =
      totalStarts > 0
        ? Math.round((totalAbandons / totalStarts) * 100 * 100) / 100
        : 0;

    // Get field analytics
    const fieldAnalytics = await this.prisma.$queryRaw<
      Array<{
        field_name: string;
        focus_count: bigint;
        fill_count: bigint;
      }>
    >`
      SELECT
        field_name,
        SUM(focus_count) as focus_count,
        SUM(fill_count) as fill_count
      FROM mv_form_field_analytics_daily
      WHERE site_key = ${siteKey}
        AND bucket_date >= ${dateRange.start}
        AND bucket_date <= ${dateRange.end}
        AND field_name IS NOT NULL
      GROUP BY field_name
      ORDER BY focus_count DESC
    `;

    // Calculate average completion time (approximate)
    const avgTimeResult = await this.prisma.$queryRaw<
      Array<{ avg_time: number }>
    >`
      SELECT AVG(
        EXTRACT(EPOCH FROM (
          (SELECT MIN(ts) FROM "Event" e2
           WHERE e2."sessionId" = e1."sessionId"
           AND e2.name = 'contact_form_submit'
           AND e2.ts > e1.ts
           LIMIT 1)
          - e1.ts
        ))
      ) as avg_time
      FROM "Event" e1
      WHERE "siteKey" = ${siteKey}
        AND name = 'contact_form_started'
        AND ts >= ${dateRange.start}
        AND ts <= ${dateRange.end}
    `;

    return {
      totalStarts,
      totalSubmits,
      totalAbandons,
      completionRate,
      abandonmentRate,
      avgCompletionTime: Math.round(avgTimeResult[0]?.avg_time || 0),
      fieldAnalytics: fieldAnalytics.map((f) => {
        const focusCount = Number(f.focus_count);
        const fillCount = Number(f.fill_count);
        return {
          field: f.field_name,
          focusCount,
          fillRate:
            focusCount > 0
              ? Math.round((fillCount / focusCount) * 100 * 100) / 100
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
   * Gets form abandonment analytics
   */
  async getFormAbandonmentReasons(
    siteKey: string,
    queryDto: InsightsQueryDto,
  ): Promise<FormAbandonmentResponse> {
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

    // Get total abandons
    const totalResult = await this.prisma.$queryRaw<Array<{ total: bigint }>>`
      SELECT SUM(forms_abandoned) as total
      FROM mv_form_analytics_daily
      WHERE site_key = ${siteKey}
        AND bucket_date >= ${dateRange.start}
        AND bucket_date <= ${dateRange.end}
    `;

    const totalAbandons = Number(totalResult[0]?.total || 0);

    // Get commonly abandoned fields (fields with low fill rates)
    const abandonedFields = await this.prisma.$queryRaw<
      Array<{
        field_name: string;
        focus_count: bigint;
        fill_count: bigint;
      }>
    >`
      SELECT
        field_name,
        SUM(focus_count) as focus_count,
        SUM(fill_count) as fill_count
      FROM mv_form_field_analytics_daily
      WHERE site_key = ${siteKey}
        AND bucket_date >= ${dateRange.start}
        AND bucket_date <= ${dateRange.end}
        AND field_name IS NOT NULL
      GROUP BY field_name
      HAVING SUM(focus_count) > 0
      ORDER BY (SUM(fill_count)::FLOAT / SUM(focus_count)::FLOAT) ASC
      LIMIT ${queryDto.limit || 10}
    `;

    return {
      totalAbandons,
      abandonmentsByStage: [], // Could be enhanced with stage tracking
      commonlyAbandonedFields: abandonedFields.map((f) => {
        const focusCount = Number(f.focus_count);
        const fillCount = Number(f.fill_count);
        const abandonCount = focusCount - fillCount;

        return {
          field: f.field_name,
          abandonCount,
        };
      }),
      period: {
        start: dateRange.start.toISOString(),
        end: dateRange.end.toISOString(),
      },
    };
  }
}
