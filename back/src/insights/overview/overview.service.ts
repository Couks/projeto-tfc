import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { InsightsQueryDto } from '../dto/insights-query.dto';
import { DateFilter } from '../../events/dto/get-events.dto';
import {
  DevicesResponse,
  DevicesTimeSeriesResponse,
} from '../interfaces/insights.interface';

@Injectable()
export class OverviewService {
  private readonly logger = new Logger(OverviewService.name);

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

  async getDevices(
    siteKey: string,
    queryDto: InsightsQueryDto,
  ): Promise<DevicesResponse> {
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
        properties->>'device_type' as device_type,
        properties->>'os' as os,
        properties->>'browser' as browser,
        COUNT(*) as count
      FROM "Event"
      WHERE "siteKey" = ${siteKey}
        AND ts >= ${dateRange.start}
        AND ts <= ${dateRange.end}
        AND properties->>'device_type' IS NOT NULL
        AND properties->>'os' IS NOT NULL
        AND properties->>'browser' IS NOT NULL
      GROUP BY properties->>'device_type', properties->>'os', properties->>'browser'
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

  async getDevicesTimeSeries(
    siteKey: string,
    queryDto: InsightsQueryDto,
  ): Promise<DevicesTimeSeriesResponse> {
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

    const dailyData = await this.prisma.$queryRaw<
      Array<{
        bucket_date: Date;
        device_type: string;
        count: bigint;
      }>
    >`
      SELECT
        DATE(ts) as bucket_date,
        properties->>'device_type' as device_type,
        COUNT(*) as count
      FROM "Event"
      WHERE "siteKey" = ${siteKey}
        AND ts >= ${dateRange.start}
        AND ts <= ${dateRange.end}
        AND properties->>'device_type' IN ('mobile', 'desktop')
      GROUP BY DATE(ts), properties->>'device_type'
      ORDER BY bucket_date ASC
    `;

    const dataMap = new Map<string, { mobile: number; desktop: number }>();

    dailyData.forEach((row) => {
      const dateKey = row.bucket_date.toISOString().split('T')[0];
      if (!dataMap.has(dateKey)) {
        dataMap.set(dateKey, { mobile: 0, desktop: 0 });
      }
      const entry = dataMap.get(dateKey)!;
      if (row.device_type === 'mobile') {
        entry.mobile = Number(row.count);
      } else if (row.device_type === 'desktop') {
        entry.desktop = Number(row.count);
      }
    });

    const data = Array.from(dataMap.entries())
      .map(([date, counts]) => ({
        date,
        mobile: counts.mobile,
        desktop: counts.desktop,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      data,
      period: {
        start: dateRange.start.toISOString(),
        end: dateRange.end.toISOString(),
      },
    };
  }
}
