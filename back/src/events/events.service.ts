import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TrackEventDto } from './dto/track-event.dto';
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
