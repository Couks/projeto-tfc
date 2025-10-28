import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TrackEventDto } from './dto/track-event.dto';
import { GetEventsDto, DateFilter } from './dto/get-events.dto';
import { EventsListResponse } from './interfaces/events.interface';
import { Prisma } from '@prisma/client';

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Ingests a single event
   * @param siteKey Site key from tenant guard
   * @param eventDto Event data
   * @param metadata Server-side metadata (IP, userAgent, etc.)
   * @returns Created event
   */
  async ingest(
    siteKey: string,
    eventDto: TrackEventDto,
    metadata: { ip?: string; userAgent?: string },
  ) {
    const { name, userId, sessionId, ts, properties, context } = eventDto;

    // Validate event name
    if (!name || name.length === 0) {
      throw new BadRequestException('Event name is required');
    }

    // Enrich context with server-side data
    const enrichedContext = {
      ...context,
      serverTs: new Date().toISOString(),
      ip: metadata.ip ? this.anonymizeIp(metadata.ip) : undefined,
      userAgent: metadata.userAgent,
    };

    // Create event
    const event = await this.prisma.event.create({
      data: {
        siteKey,
        name,
        userId,
        sessionId,
        ts: ts ? new Date(ts) : new Date(),
        properties: (properties || {}) as Prisma.InputJsonValue,
        context: enrichedContext as Prisma.InputJsonValue,
      },
    });

    this.logger.log(`Event ingested: ${name} for site: ${siteKey}`);

    return {
      id: event.id.toString(),
      success: true,
    };
  }

  /**
   * Ingests multiple events in batch
   * @param siteKey Site key from tenant guard
   * @param events Array of events
   * @param metadata Server-side metadata
   * @returns Batch result
   */
  async ingestBatch(
    siteKey: string,
    events: TrackEventDto[],
    metadata: { ip?: string; userAgent?: string },
  ) {
    if (!events || events.length === 0) {
      throw new BadRequestException('Events array is required');
    }

    if (events.length > 500) {
      throw new BadRequestException('Maximum 500 events per batch');
    }

    const enrichedContext = {
      serverTs: new Date().toISOString(),
      ip: metadata.ip ? this.anonymizeIp(metadata.ip) : undefined,
      userAgent: metadata.userAgent,
    };

    // Prepare events for batch insert
    const eventsData = events.map((event) => ({
      siteKey,
      name: event.name,
      userId: event.userId,
      sessionId: event.sessionId,
      ts: event.ts ? new Date(event.ts) : new Date(),
      properties: event.properties || {},
      context: {
        ...event.context,
        ...enrichedContext,
      },
    }));

    // Batch insert with chunking for very large batches
    const chunkSize = 100;
    let totalInserted = 0;

    for (let i = 0; i < eventsData.length; i += chunkSize) {
      const chunk = eventsData.slice(i, i + chunkSize);
      const result = await this.prisma.event.createMany({
        data: chunk as Prisma.EventCreateManyInput[],
        skipDuplicates: false,
      });
      totalInserted += result.count;
    }

    this.logger.log(
      `Batch ingested: ${totalInserted} events for site: ${siteKey}`,
    );

    return {
      success: true,
      count: totalInserted,
    };
  }

  /**
   * Gets events for a specific site with filtering and pagination
   * @param siteKey Site key from tenant guard
   * @param queryDto Query parameters for filtering
   * @returns Paginated events list
   */
  async getEvents(
    siteKey: string,
    queryDto: GetEventsDto,
  ): Promise<EventsListResponse> {
    try {
      const {
        name,
        userId,
        sessionId,
        dateFilter,
        startDate,
        endDate,
        limit = 100,
        offset = 0,
        orderBy = 'ts',
        order = 'desc',
      } = queryDto;

      // Build where clause
      const where: Prisma.EventWhereInput = {
        siteKey,
      };

      // Filter by event name
      if (name) {
        where.name = {
          contains: name,
          mode: 'insensitive',
        };
      }

      // Filter by user ID
      if (userId) {
        where.userId = userId;
      }

      // Filter by session ID
      if (sessionId) {
        where.sessionId = sessionId;
      }

      // Apply date filters
      const dateRange = this.getDateRange(dateFilter, startDate, endDate);
      if (dateRange.start && dateRange.end) {
        where.ts = {
          gte: dateRange.start,
          lte: dateRange.end,
        };
      }

      // Build orderBy clause
      const orderByClause: Prisma.EventOrderByWithRelationInput = {};
      orderByClause[orderBy] = order;

      // Execute query with pagination
      const [events, totalCount] = await Promise.all([
        this.prisma.event.findMany({
          where,
          orderBy: orderByClause,
          take: limit,
          skip: offset,
          select: {
            id: true,
            name: true,
            userId: true,
            sessionId: true,
            properties: true,
            context: true,
            ts: true,
            createdAt: true,
          },
        }),
        this.prisma.event.count({ where }),
      ]);

      this.logger.log(
        `Retrieved ${events.length} events for site: ${siteKey} (total: ${totalCount})`,
      );

      return {
        events: events.map((event) => ({
          id: event.id.toString(),
          name: event.name,
          userId: event.userId,
          sessionId: event.sessionId,
          properties: event.properties,
          context: event.context,
          ts: event.ts.toISOString(),
          createdAt: event.createdAt.toISOString(),
        })),
        pagination: {
          total: totalCount,
          limit,
          offset,
          hasMore: offset + limit < totalCount,
        },
      };
    } catch (error) {
      this.logger.error(
        `Error retrieving events for site ${siteKey}:`,
        error instanceof Error ? error.stack : 'Unknown error',
      );
      throw error;
    }
  }

  /**
   * Gets date range based on filter type
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
   * Anonymizes IP address for LGPD/GDPR compliance
   * @param ip IP address
   * @returns Anonymized IP
   */
  private anonymizeIp(ip: string): string {
    const parts = ip.split('.');
    if (parts.length === 4) {
      // IPv4: Replace last octet with 0
      return `${parts[0]}.${parts[1]}.${parts[2]}.0`;
    }
    // IPv6: Keep first 48 bits
    const ipv6Parts = ip.split(':');
    if (ipv6Parts.length >= 3) {
      return `${ipv6Parts[0]}:${ipv6Parts[1]}:${ipv6Parts[2]}::`;
    }
    return ip;
  }
}
