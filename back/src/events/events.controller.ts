import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import type { Request } from 'express';
import { Throttle } from '@nestjs/throttler';
import { EventsService } from './events.service';
import { TrackEventDto } from './dto/track-event.dto';
import { TrackBatchDto } from './dto/track-batch.dto';
import { GetEventsDto } from './dto/get-events.dto';
import { EventsListResponse } from './interfaces/events.interface';
import { TenantGuard } from '../common/guards/tenant.guard';
import { SiteKey } from '../common/decorators/site-key.decorator';

@ApiTags('events')
@Controller('events')
@UseGuards(TenantGuard)
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  /**
   * Gets events for a specific site with filtering and pagination
   * @param siteKey Site key from tenant guard
   * @param queryDto Query parameters for filtering
   * @returns Paginated events list
   */
  @Get()
  @ApiOperation({
    summary: 'Get events for a site with filtering and pagination',
  })
  @ApiResponse({ status: 200, description: 'Return paginated events list.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @Throttle({ default: { limit: 100, ttl: 60000 } }) // 100 req/min
  async getEvents(
    @SiteKey() siteKey: string,
    @Query() queryDto: GetEventsDto,
  ): Promise<EventsListResponse> {
    return await this.eventsService.getEvents(siteKey, queryDto);
  }

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

  /**
   * Smoke test endpoint for health checks
   * @returns Service status
   */
  @Get('admin/test')
  @ApiOperation({ summary: 'Smoke test endpoint' })
  @ApiResponse({ status: 200, description: 'Service is healthy.' })
  test(): Promise<{ status: string }> {
    return Promise.resolve({ status: 'ok' });
  }
}
