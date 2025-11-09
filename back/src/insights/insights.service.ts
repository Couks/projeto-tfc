import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InsightsQueryDto } from './dto/insights-query.dto';
import { DateFilter } from '../events/dto/get-events.dto';
import { DevicesResponse } from './interfaces/insights.interface';

@Injectable()
export class InsightsService {
  private readonly logger = new Logger(InsightsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Gets date range based on filter type (reused from EventsService)
   * @param dateFilter Filter type
   * @param startDate Custom start date
   * @param endDate Custom end date
   * @returns Date range object
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
      start.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
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
   * Gets device analytics for a site using materialized views
   * @param siteKey Site key
   * @param queryDto Query parameters
   * @returns Device data
   */
  async getDevices(
    siteKey: string,
    queryDto: InsightsQueryDto,
  ): Promise<DevicesResponse> {
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

    const devices = await this.prisma.$queryRaw<
      Array<{
        device_type: string;
        os: string;
        browser: string;
        count: bigint;
      }>
    >`
      SELECT
        device_type,
        os,
        browser,
        SUM(events_count) as count
      FROM mv_devices_daily
      WHERE site_key = ${siteKey}
        AND bucket_date >= ${dateRange.start}
        AND bucket_date <= ${dateRange.end}
      GROUP BY device_type, os, browser
      ORDER BY count DESC
      LIMIT ${queryDto.limit || 10}
    `;

    return {
      devices: devices.map((d) => ({
        deviceType: d.device_type,
        os: d.os,
        browser: d.browser,
        count: Number(d.count),
      })),
    };
  }

  /**
   * Refreshes materialized views for a date range (admin only)
   * @param fromDate Start date
   * @param toDate End date
   */
  async refreshMaterializedViews(fromDate: Date, toDate: Date): Promise<void> {
    this.logger.log(
      `Refreshing materialized views from ${fromDate.toISOString()} to ${toDate.toISOString()}`,
    );

    const fromDateStr = fromDate.toISOString().split('T')[0];
    const toDateStr = toDate.toISOString().split('T')[0];

    await this.prisma.$executeRaw`
      SELECT insights_refresh(${fromDateStr}::date, ${toDateStr}::date)
    `;

    this.logger.log('Materialized views refreshed successfully');
  }
}
