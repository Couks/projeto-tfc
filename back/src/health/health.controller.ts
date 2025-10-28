import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { HealthService } from './health.service';

@ApiTags('Health')
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
