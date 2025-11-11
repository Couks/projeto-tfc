/**
 * configuration.ts - Configuração de variáveis de ambiente
 *
 * Carrega e organiza as variáveis de ambiente usadas na aplicação.
 * Utilizado pelo ConfigModule para fornecer configurações de forma segura.
 *
 * Estrutura:
 * - port: Porta do servidor HTTP
 * - nodeEnv: Ambiente (development, production, test)
 * - database: URLs do PostgreSQL
 * - auth: Secret de autenticação JWT
 * - api: URL base da API
 *
 * Exemplo de uso:
 * constructor(private configService: ConfigService) {
 *   const port = this.configService.get<number>('port');
 *   const dbUrl = this.configService.get<string>('database.url');
 * }
 */

export default () => {
  // Porta utilizada pelo servidor HTTP (padrão 3001)
  const port = process.env.PORT || 3001;

  // Ambiente da aplicação (development, production, test)
  const nodeEnv = process.env.NODE_ENV || 'development';

  // URLs do banco de dados PostgreSQL
  const databaseUrl = process.env.DATABASE_URL;
  const directUrl = process.env.DIRECT_URL;

  // Secret para autenticação (JWT, NextAuth)
  const nextauthSecret =
    process.env.NEXTAUTH_SECRET || 'dev-secret-do-not-use-in-prod';

  // URL base da API
  const apiBaseUrl = process.env.API_BASE_URL || '';

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
