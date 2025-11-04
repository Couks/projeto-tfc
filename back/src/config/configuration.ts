/**
 * configuration.ts - Configuração de Variáveis de Ambiente
 *
 * Este arquivo centraliza o carregamento e estruturação das variáveis de ambiente.
 * É usado pelo ConfigModule para fornecer configurações type-safe para toda a aplicação.
 *
 * Estrutura das configurações:
 * - port: Porta do servidor HTTP
 * - nodeEnv: Ambiente de execução (development, production, test)
 * - database: URLs de conexão com PostgreSQL
 * - auth: Secret para assinatura de session cookies
 * - api: URL base da API (usado para gerar links)
 *
 * Como usar em outros módulos:
 * ```typescript
 * constructor(private configService: ConfigService) {
 *   const port = this.configService.get<number>('port');
 *   const dbUrl = this.configService.get<string>('database.url');
 * }
 * ```
 */

import { Logger } from '@nestjs/common';

/**
 * Helper function to mask sensitive values in logs
 */
function maskSensitiveValue(value: string | undefined): string {
  if (!value) return 'undefined';
  if (value.length <= 8) return '***';
  return `${value.substring(0, 4)}***${value.substring(value.length - 4)}`;
}

/**
 * Helper function to extract host from database URL for logging
 */
function extractDbHost(url: string | undefined): string {
  if (!url) return 'undefined';
  try {
    const urlObj = new URL(url);
    return `${urlObj.protocol}//${urlObj.host}${urlObj.pathname.split('/')[0]}`;
  } catch {
    return maskSensitiveValue(url);
  }
}

export default () => {
  const logger = new Logger('Configuration');

  // Porta do servidor HTTP (padrão: 3001)
  const port = process.env.PORT || 3001;
  logger.log(`[ENV] PORT: ${port}`);

  // Ambiente de execução (development, production, test)
  const nodeEnv = process.env.NODE_ENV || 'development';
  logger.log(`[ENV] NODE_ENV: ${nodeEnv}`);

  // Configurações do banco de dados PostgreSQL
  const databaseUrl = process.env.DATABASE_URL;
  const directUrl = process.env.DIRECT_URL;
  logger.log(`[ENV] DATABASE_URL: ${extractDbHost(databaseUrl)}`);
  logger.log(`[ENV] DIRECT_URL: ${extractDbHost(directUrl)}`);

  // Configurações de autenticação
  const nextauthSecret =
    process.env.NEXTAUTH_SECRET || 'dev-secret-do-not-use-in-prod';
  logger.log(
    `[ENV] NEXTAUTH_SECRET: ${maskSensitiveValue(nextauthSecret)} (length: ${nextauthSecret.length})`,
  );

  // Configurações da API
  const apiBaseUrl = process.env.API_BASE_URL || '';
  logger.log(`[ENV] API_BASE_URL: ${apiBaseUrl}`);

  return {
    port,
    nodeEnv,
    database: {
      url: databaseUrl,
      directUrl,
    },
    auth: {
      secret: nextauthSecret,
    },
    api: {
      baseUrl: apiBaseUrl,
    },
  };
};
