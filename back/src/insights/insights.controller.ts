import { Controller, Post, UseGuards, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { InsightsService } from './insights.service';
import { RefreshMaterializedViewsDto } from './dto/refresh-materialized-views.dto';
import { UnifiedGuard } from '../common/guards/unified.guard';
import { RequireTenant } from '../common/decorators/require-tenant.decorator';

@ApiTags('Insights - Admin')
@Controller('insights')
@UseGuards(UnifiedGuard)
@RequireTenant()
export class InsightsController {
  constructor(private readonly insightsService: InsightsService) {}

  @Post('admin/refresh')
  @ApiOperation({
    summary: 'Refresh materialized views for date range',
    description:
      'Refreshes all materialized views. If no date range provided, refreshes last 90 days.',
  })
  @ApiResponse({ status: 200, description: 'Materialized views refreshed.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async refreshMaterializedViews(@Body() body: RefreshMaterializedViewsDto) {
    // Default to last 90 days if not provided
    const now = new Date();
    const fromDate = body.fromDate
      ? new Date(body.fromDate)
      : new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    const toDate = body.toDate ? new Date(body.toDate) : now;

    await this.insightsService.refreshMaterializedViews(fromDate, toDate);

    return {
      success: true,
      message: `Materialized views refreshed from ${fromDate.toISOString()} to ${toDate.toISOString()}`,
      fromDate: fromDate.toISOString(),
      toDate: toDate.toISOString(),
    };
  }
}
