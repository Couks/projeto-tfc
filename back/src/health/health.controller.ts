import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HealthService } from './health.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  /**
   * Checagem básica de saúde
   * @returns Status de saúde
   */
  @Get()
  @ApiOperation({
    summary: 'Verificação básica de saúde',
    description: 'Verifica se a aplicação está funcionando corretamente.',
  })
  @ApiResponse({
    status: 200,
    description: 'Aplicação está funcionando corretamente.',
  })
  check() {
    return this.healthService.check();
  }

  /**
   * Checagem de saúde do banco de dados
   * @returns Status da conexão com o banco de dados
   */
  @Get('db')
  @ApiOperation({
    summary: 'Verificação de saúde do banco de dados',
    description: 'Verifica se a conexão com o banco de dados está funcionando.',
  })
  @ApiResponse({
    status: 200,
    description: 'Banco de dados está acessível.',
  })
  @ApiResponse({
    status: 503,
    description: 'Banco de dados não está acessível.',
  })
  async checkDatabase() {
    return this.healthService.checkDatabase();
  }
}
