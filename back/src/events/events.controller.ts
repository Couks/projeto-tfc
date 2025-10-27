import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import type { Request } from 'express';
import { Throttle } from '@nestjs/throttler';
import { EventsService } from './events.service';
import { TrackEventDto } from './dto/track-event.dto';
import { TrackBatchDto } from './dto/track-batch.dto';
import { TenantGuard } from '../common/guards/tenant.guard';
import { SiteKey } from '../common/decorators/site-key.decorator';

@Controller('events')
@UseGuards(TenantGuard)
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  /**
   * Tracks a single event
   * @param siteKey Site key from tenant guard
   * @param req Request object
   * @param trackEventDto Event data
   * @returns Ingestion result
   */
  @Post('track')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 1000, ttl: 60000 } }) // 1000 req/min per site
  async track(
    @SiteKey() siteKey: string,
    @Req() req: Request,
    @Body() trackEventDto: TrackEventDto,
  ) {
    const metadata = {
      ip: req.ip || req.headers['x-forwarded-for']?.toString(),
      userAgent: req.headers['user-agent'],
    };

    return this.eventsService.ingest(siteKey, trackEventDto, metadata);
  }

  /**
   * Tracks multiple events in batch
   * @param siteKey Site key from tenant guard
   * @param req Request object
   * @param trackBatchDto Batch of events
   * @returns Batch ingestion result
   */
  @Post('track/batch')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 100, ttl: 60000 } }) // 100 req/min for batch
  async trackBatch(@Req() req: Request, @Body() trackBatchDto: TrackBatchDto) {
    // Extrai siteKey do header ou query para validação manual
    const siteKey =
      (req.headers['x-site-key'] as string) || (req.query.site as string);

    if (!siteKey) {
      throw new BadRequestException('Missing site key');
    }

    const metadata = {
      ip: req.ip || req.headers['x-forwarded-for']?.toString(),
      userAgent: req.headers['user-agent'],
    };

    return this.eventsService.ingestBatch(
      siteKey,
      trackBatchDto.events,
      metadata,
    );
  }
}
