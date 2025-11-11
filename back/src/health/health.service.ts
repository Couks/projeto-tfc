import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Faz uma checagem básica de saúde
   * @returns Objeto com status de saúde
   */
  check() {
    const nodeEnv = process.env.NODE_ENV || 'development';

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: nodeEnv,
    };
  }

  /**
   * Verifica a conexão com o banco de dados
   * @returns Status da conexão com o banco de dados
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
      this.logger.error('A checagem do banco de dados falhou', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Erro desconhecido';
      return {
        status: 'error',
        database: 'disconnected',
        error: errorMessage,
        timestamp: new Date().toISOString(),
      };
    }
  }
}
