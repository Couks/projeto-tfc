import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InsightsService {
  private readonly logger = new Logger(InsightsService.name);

  constructor(private readonly prisma: PrismaService) {}

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
