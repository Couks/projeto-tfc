import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Performs basic health check
   * @returns Health status object
   */
  check() {
    const nodeEnv = process.env.NODE_ENV || 'development';
    this.logger.log(`[ENV] NODE_ENV in health check: ${nodeEnv}`);

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: nodeEnv,
    };
  }

  /**
   * Checks database connection health
   * @returns Database health status
   */
  async checkDatabase() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return {
        status: 'ok',
        database: 'connected',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Database health check failed', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      return {
        status: 'error',
        database: 'disconnected',
        error: errorMessage,
        timestamp: new Date().toISOString(),
      };
    }
  }
}
