/**
 * main.ts - Ponto de Entrada da Aplicação
 *
 * Este arquivo é responsável por:
 * - Inicializar a aplicação NestJS
 * - Configurar middlewares de segurança (Helmet)
 * - Configurar compressão e parsing de cookies
 * - Configurar validação global de DTOs
 * - Configurar documentação Swagger/OpenAPI
 * - Configurar logging global de requisições
 *
 * Ordem de inicialização:
 * 1. Criar aplicação NestJS
 * 2. Obter configurações do ambiente
 * 3. Aplicar middlewares de segurança
 * 4. Aplicar validação global
 * 5. Configurar Swagger
 * 6. Iniciar servidor HTTP
 */

import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

/**
 * Função bootstrap - Inicializa e configura a aplicação
 */
async function bootstrap() {
  const logger = new Logger('Bootstrap');

  try {
    // Cria a aplicação NestJS com todos os níveis de log habilitados
    // Usa NestExpressApplication para servir arquivos estáticos
    const app = await NestFactory.create<NestExpressApplication>(AppModule, {
      logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    });

    // Obtém o serviço de configuração para acessar variáveis de ambiente
    const configService = app.get(ConfigService);
    const port = configService.get<number>('port') || 3001;
    const nodeEnv = configService.get<string>('nodeEnv');
    const databaseUrl = configService.get<string>('database.url');
    const directUrl = configService.get<string>('database.directUrl');
    const nextauthSecret = configService.get<string>('auth.secret');
    const apiBaseUrl = configService.get<string>('api.baseUrl');

    // Log environment variables loaded via ConfigService
    logger.log(`[ConfigService] PORT: ${port}`);
    logger.log(`[ConfigService] NODE_ENV: ${nodeEnv || 'undefined'}`);
    try {
      logger.log(
        `[ConfigService] DATABASE_URL: ${databaseUrl ? `${new URL(databaseUrl).protocol}//${new URL(databaseUrl).host}` : 'undefined'}`,
      );
    } catch {
      logger.log(
        `[ConfigService] DATABASE_URL: ${databaseUrl ? 'invalid format' : 'undefined'}`,
      );
    }
    try {
      logger.log(
        `[ConfigService] DIRECT_URL: ${directUrl ? `${new URL(directUrl).protocol}//${new URL(directUrl).host}` : 'undefined'}`,
      );
    } catch {
      logger.log(
        `[ConfigService] DIRECT_URL: ${directUrl ? 'invalid format' : 'undefined'}`,
      );
    }
    logger.log(
      `[ConfigService] NEXTAUTH_SECRET: ${nextauthSecret ? `${nextauthSecret.substring(0, 4)}***${nextauthSecret.substring(nextauthSecret.length - 4)} (length: ${nextauthSecret.length})` : 'undefined'}`,
    );
    logger.log(`[ConfigService] API_BASE_URL: ${apiBaseUrl || 'undefined'}`);

    // ============================================
    // MIDDLEWARE DE SEGURANÇA - HELMET
    // ============================================
    // Helmet adiciona headers HTTP de segurança automaticamente
    // Configuração personalizada para permitir SDK em qualquer site
    app.use(
      helmet({
        // Desabilita CSP para endpoints do SDK (permite execução em qualquer site)
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", '*'],
            styleSrc: ["'self'", "'unsafe-inline'", '*'],
            imgSrc: ["'self'", 'data:', '*'],
            connectSrc: ["'self'", '*'],
            fontSrc: ["'self'", '*'],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'", '*'],
            frameSrc: ["'self'", '*'],
          },
        },
        // Permite que o SDK seja carregado em frames de outros sites
        frameguard: false,
        // Permite carregamento de recursos de qualquer origem para o SDK
        crossOriginEmbedderPolicy: false,
        crossOriginOpenerPolicy: false,
        crossOriginResourcePolicy: { policy: 'cross-origin' },
      }),
    );

    // ============================================
    // MIDDLEWARE DE COMPRESSÃO
    // ============================================
    // Comprime as respostas HTTP usando gzip para reduzir o tamanho dos dados transmitidos
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    app.use(compression());

    // ============================================
    // MIDDLEWARE DE PARSING DE COOKIES
    // ============================================
    // Parseia cookies HTTP para torná-los acessíveis via request.cookies
    // Usado para ler o cookie de sessão 'admin_session'
    app.use(cookieParser());

    // ============================================
    // CONFIGURAÇÃO DE CORS
    // ============================================
    // Permite requisições cross-origin para produção
    app.enableCors({
      origin: [
        'https://insighthouse.matheuscastroks.com.br',
        'http://localhost:3000',
        'http://localhost:3002',
        // Permite qualquer origem para endpoints do SDK
        /^https?:\/\/.*\.matheuscastro\.rocketdecolando\.com\.br$/,
        /^https?:\/\/.*\.rocketdecolando\.com\.br$/,
      ],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Site-Key'],
    });

    // ============================================
    // VALIDAÇÃO GLOBAL DE DTOs
    // ============================================
    // ValidationPipe aplica validação automática em todos os DTOs
    // whitelist: remove propriedades não definidas nos DTOs
    // forbidNonWhitelisted: lança erro se propriedades extras forem enviadas
    // transform: converte automaticamente tipos (ex: string '123' para number 123)
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true, // Remove campos não definidos no DTO
        forbidNonWhitelisted: false, // Permite campos extras (não bloqueia payloads do SDK)
        transform: true, // Converte tipos automaticamente
        transformOptions: {
          enableImplicitConversion: true, // Conversão implícita de tipos
        },
        validationError: {
          target: false, // não incluir o objeto alvo nos erros
          value: false, // não incluir o valor inválido para evitar logs sensíveis
        },
        exceptionFactory: (errors) => {
          // Retorna um corpo detalhado para facilitar o debug de payloads inválidos
          const formatted = errors.map((e) => ({
            property: e.property,
            constraints: e.constraints,
            children: e.children?.map((c) => ({
              property: c.property,
              constraints: c.constraints,
            })),
          }));
          return new BadRequestException({
            message: 'Validation failed',
            errors: formatted,
          });
        },
      }),
    );

    // ============================================
    // ARQUIVOS ESTÁTICOS (ANTES DO PREFIXO GLOBAL)
    // ============================================
    // Serve arquivos estáticos da pasta public/
    // Permite servir o SDK JavaScript diretamente do backend
    app.useStaticAssets(join(__dirname, 'public'), {
      prefix: '/static/', // URLs: /static/capture-filters.js
    });

    // ============================================
    // PREFIXO GLOBAL DE ROTAS
    // ============================================
    // Todas as rotas terão o prefixo /api
    // Exemplo: AuthController /auth vira /api/auth
    app.setGlobalPrefix('api');

    // ============================================
    // INTERCEPTOR GLOBAL DE LOGGING
    // ============================================
    // Registra todas as requisições e respostas com duração
    app.useGlobalInterceptors(new LoggingInterceptor());

    // ============================================
    // DOCUMENTAÇÃO SWAGGER/OPENAPI
    // ============================================
    // Configuração da documentação interativa da API
    const swaggerConfig = new DocumentBuilder()
      .setTitle('InsightHouse Analytics API')
      .setDescription(
        'Complete API for web analytics and event tracking with multi-tenant support. ' +
          'Track user behavior, conversions, and generate insights from your data.',
      )
      .setVersion('1.0.0')
      .setContact(
        'InsightHouse Team',
        'https://github.com/Couks',
        'matheuscastroks@gmail.com',
      )
      .setLicense('MIT', 'https://opensource.org/licenses/MIT')
      // Tags para organizar endpoints na documentação
      .addTag('Authentication', 'User authentication and session management')
      .addTag('Sites', 'Site management and multi-tenant configuration')
      .addTag('Events', 'Event tracking and data ingestion')
      .addTag('Insights', 'Analytics queries and data visualization')
      .addTag('SDK', 'SDK loader and client configuration')
      .addTag('Health', 'Health check and system status endpoints')
      // Esquema de autenticação: Cookie para sessões de admin
      .addCookieAuth(
        'admin_session',
        {
          type: 'apiKey',
          in: 'cookie',
          name: 'admin_session',
          description: 'Session cookie for authenticated requests',
        },
        'session-auth',
      )
      // Esquema de autenticação: Header para multi-tenancy
      .addApiKey(
        {
          type: 'apiKey',
          name: 'X-Site-Key',
          in: 'header',
          description:
            'Site key for multi-tenant operations and event tracking',
        },
        'site-key',
      )
      // Servidores disponíveis
      .addServer('https://api.matheuscastroks.com.br', 'Production')
      .build();

    // Gera o documento OpenAPI com IDs de operação únicos
    const document = SwaggerModule.createDocument(app, swaggerConfig, {
      operationIdFactory: (controllerKey: string, methodKey: string) =>
        `${controllerKey}_${methodKey}`,
    });

    // Configura a interface Swagger UI em /api/docs
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true, // Mantém autenticação entre reloads
        docExpansion: 'none', // Começa com tudo fechado
        filter: true, // Habilita busca de endpoints
        showRequestDuration: true, // Mostra tempo de resposta
        syntaxHighlight: {
          theme: 'monokai', // Tema de código
        },
        tryItOutEnabled: true, // Habilita teste direto dos endpoints
      },
      customSiteTitle: 'InsightHouse API Documentation',
      customfavIcon: '/favicon.ico',
      // CSS customizado para interface mais limpa
      customCss: `
        .swagger-ui .topbar { display: none }
        .swagger-ui .info { margin: 50px 0 }
        .swagger-ui .scheme-container { background: #fafafa; padding: 20px 0 }
      `,
    });

    // Inicia o servidor HTTP na porta configurada
    await app.listen(port);

    logger.log(`Environment: ${configService.get<string>('nodeEnv')}`);
    logger.log(
      `Swagger JSON: https://api.matheuscastroks.com.br/api/docs-json`,
    );
  } catch (error) {
    // Em caso de erro na inicialização, loga o erro e encerra o processo
    logger.error(
      'Error starting the application:',
      error instanceof Error ? error.stack : String(error),
    );
    process.exit(1);
  }
}

// Executa a função bootstrap e captura erros fatais
bootstrap().catch((error) => {
  console.error('Fatal error during bootstrap:', error);
  process.exit(1);
});
