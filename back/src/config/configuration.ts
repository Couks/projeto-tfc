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
 * - frontend: URL do frontend Next.js (usado para CORS)
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

export default () => ({
  // Porta do servidor HTTP (padrão: 3001)
  port: process.env.PORT || 3001,

  // Ambiente de execução (development, production, test)
  nodeEnv: process.env.NODE_ENV || 'development',

  // Configurações do banco de dados PostgreSQL
  database: {
    url: process.env.DATABASE_URL, // URL de conexão via connection pooler
    directUrl: process.env.DIRECT_URL, // URL de conexão direta (para migrations)
  },

  // Configurações do frontend
  frontend: {
    url: process.env.FRONTEND_URL || 'http://localhost:3000', // URL do Next.js (para CORS)
  },

  // Configurações de autenticação
  auth: {
    secret: process.env.NEXTAUTH_SECRET || 'dev-secret-do-not-use-in-prod', // Secret para HMAC-SHA256
  },

  // Configurações da API
  api: {
    baseUrl: process.env.API_BASE_URL || 'http://localhost:3001', // URL base para gerar links
  },
});
