/**
 * main.ts - Início da aplicação
 *
 * Responsável por:
 * - Iniciar o NestJS
 * - Configurar Helmet (segurança)
 * - Configurar compressão e leitura de cookies
 * - Ativar validação global dos DTOs
 * - Ativar documentação Swagger/OpenAPI
 * - Ativar logging global das requisições
 *
 * Passos:
 * 1. Criar app NestJS
 * 2. Ler as configs do ambiente
 * 3. Aplicar middlewares de segurança
 * 4. Ativar validação global
 * 5. Configurar Swagger
 * 6. Subir o servidor HTTP
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
 * Função para iniciar e configurar a aplicação
 */
async function bootstrap() {
  const logger = new Logger('Bootstrap');

  try {
    // Cria app NestJS com todos logs habilitados e Express para arquivos estáticos
    const app = await NestFactory.create<NestExpressApplication>(AppModule, {
      logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    });

    // Busca configs do ambiente (variáveis)
    const configService = app.get(ConfigService);
    const port = configService.get<number>('port') || 3001;

    // Middleware de segurança Helmet, libera SDK para qualquer site
    app.use(
      helmet({
        // CSP liberado para execução em qualquer site
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
        // SDK pode ser carregado em frames de outros sites
        frameguard: false,
        // SDK pode buscar recursos de qualquer origem
        crossOriginEmbedderPolicy: false,
        crossOriginOpenerPolicy: false,
        crossOriginResourcePolicy: { policy: 'cross-origin' },
      }),
    );

    // Middleware de compressão gzip nas respostas HTTP
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    app.use(compression());

    // Middleware de leitura de cookies HTTP (req.cookies)
    app.use(cookieParser());

    // Config CORS: Libera qualquer origem para endpoints do SDK
    // (e permite origens não informadas, tipo apps mobile)
    app.enableCors({
      origin: (origin, callback) => {
        callback(null, true);
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Site-Key'],
    });

    // Validação de todos os DTOs nas rotas
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true, // Remove o que não está no DTO
        forbidNonWhitelisted: false, // Permite extras (SDKs não quebram)
        transform: true, // Converte tipos automaticamente
        transformOptions: {
          enableImplicitConversion: true, // string pra number etc
        },
        validationError: {
          target: false, // não mostra objeto original no erro
          value: false, // não mostra valor inválido (evita expor dados sensíveis)
        },
        exceptionFactory: (errors) => {
          // Formata os erros para facilitar debug
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

    // Servir arquivos estáticos da pasta public/
    // (Ex: SDK JS direto do backend)
    app.useStaticAssets(join(__dirname, 'public'), {
      prefix: '/static/', // /static/arquivo.js
    });

    // Todas rotas começam com /api (ex: /api/auth)
    app.setGlobalPrefix('api');

    // Ativa interceptor de log global (log de toda request/response)
    app.useGlobalInterceptors(new LoggingInterceptor());

    // Configuração da documentação Swagger/OpenAPI
    const swaggerConfig = new DocumentBuilder()
      .setTitle('InsightHouse Analytics API')
      .setDescription(
        'API de analytics web e rastreamento de eventos com multi-clientes. ' +
          'Monitore usuários, conversões e veja insights.',
      )
      .setVersion('1.0.0')
      .setContact(
        'Equipe InsightHouse',
        'https://github.com/Couks',
        'matheuscastroks@gmail.com',
      )
      .setLicense('MIT', 'https://opensource.org/licenses/MIT')
      // Tags para organização da docs
      .addTag('Authentication', 'Login de usuário e sessões')
      .addTag('Sites', 'Gerenciar sites e multi-tenant')
      .addTag('Events', 'Rastreamento e ingestão de eventos')
      .addTag('Insights - Overview', 'Visão geral dos dados e métricas')
      .addTag('Insights - Search', 'Busca e filtros')
      .addTag('Insights - Property', 'Analytics detalhado dos imóveis')
      .addTag('Insights - Conversion', 'Conversões, origens e leads')
      .addTag('SDK', 'SDK e configuração do cliente')
      .addTag('Health', 'Status da API e healthcheck')
      // Auth por cookie (admin) na documentação
      .addCookieAuth(
        'admin_session',
        {
          type: 'apiKey',
          in: 'cookie',
          name: 'admin_session',
          description: 'Cookie da sessão admin',
        },
        'session-auth',
      )
      // Auth por header para multi-tenant
      .addApiKey(
        {
          type: 'apiKey',
          name: 'X-Site-Key',
          in: 'header',
          description:
            'Chave do site para identificar cliente/multi-tenant e rastrear eventos',
        },
        'site-key',
      )
      // Servidor principal da API
      .addServer('https://api.matheuscastroks.com.br')
      .build();

    // Cria o documento OpenAPI (IDs de operação únicos)
    const document = SwaggerModule.createDocument(app, swaggerConfig, {
      operationIdFactory: (controllerKey: string, methodKey: string) =>
        `${controllerKey}_${methodKey}`,
    });

    // Ativa a interface Swagger UI em /api/docs
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true, // Mantém login entre reloads
        docExpansion: 'none', // Tudo fechado por padrão
        filter: true, // Buscar endpoints
        showRequestDuration: true, // Tempo da request
        syntaxHighlight: {
          theme: 'monokai', // Tema escuro
        },
        tryItOutEnabled: true, // Permite testar endpoints direto
      },
      customSiteTitle: 'API InsightHouse Docs',
      customfavIcon: '/favicon.ico',
      // CSS para visual mais limpo
      customCss: `
        .swagger-ui .topbar { display: none }
        .swagger-ui .info { margin: 50px 0 }
        .swagger-ui .scheme-container { background: #fafafa; padding: 20px 0 }
      `,
    });

    // Sobe o servidor HTTP na porta configurada
    await app.listen(port);

    logger.log(`Env: ${configService.get<string>('nodeEnv')}`);
    logger.log(
      `Swagger JSON: https://api.matheuscastroks.com.br/api/docs-json`,
    );
  } catch (error) {
    // Se der erro na inicialização, mostra o erro e encerra
    logger.error(
      'Erro ao iniciar aplicação:',
      error instanceof Error ? error.stack : String(error),
    );
    process.exit(1);
  }
}

// Inicia a função bootstrap e trata erro fatal
bootstrap().catch((error) => {
  console.error('Erro fatal no bootstrap:', error);
  process.exit(1);
});
