import { Controller, Get } from '@nestjs/common';
import { HealthService } from './health.service';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  /**
   * Basic health check endpoint
   * @returns Health status
   */
  @Get()
  check() {
    return this.healthService.check();
  }

  /**
   * Database health check endpoint
   * @returns Database connection status
   */
  @Get('db')
  async checkDatabase() {
    return this.healthService.checkDatabase();
  }
}
