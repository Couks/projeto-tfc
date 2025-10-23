import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  try {
    const app = await NestFactory.create(AppModule, {
      logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    });

    const configService = app.get(ConfigService);
    const port = configService.get<number>('PORT') || 3001;
    const frontendUrl = configService.get<string>('frontend.url');

    // Security middleware

    app.use(
      helmet({
        crossOriginResourcePolicy: { policy: 'cross-origin' },
      }),
    );

    // Compression
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    app.use(compression());

    // Cookie parser
    app.use(cookieParser());

    // CORS configuration
    app.enableCors({
      origin: [frontendUrl, 'http://localhost:3000'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Site-Key'],
    });

    // Global validation pipe
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );

    // Global prefix for API routes
    app.setGlobalPrefix('api');

    // Global logging interceptor
    app.useGlobalInterceptors(new LoggingInterceptor());

    // Swagger Documentation
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
      .addTag('Authentication', 'User authentication and session management')
      .addTag('Sites', 'Site management and multi-tenant configuration')
      .addTag('Events', 'Event tracking and data ingestion')
      .addTag('Insights', 'Analytics queries and data visualization')
      .addTag('SDK', 'SDK loader and client configuration')
      .addTag('Health', 'Health check and system status endpoints')
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
      .addServer(`http://localhost:${port}`, 'Local Development')
      .addServer('https://insighthouse.vercel.app', 'Production')
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig, {
      operationIdFactory: (controllerKey: string, methodKey: string) =>
        `${controllerKey}_${methodKey}`,
    });

    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        docExpansion: 'none',
        filter: true,
        showRequestDuration: true,
        syntaxHighlight: {
          theme: 'monokai',
        },
        tryItOutEnabled: true,
      },
      customSiteTitle: 'InsightHouse API Documentation',
      customfavIcon: '/favicon.ico',
      customCss: `
        .swagger-ui .topbar { display: none }
        .swagger-ui .info { margin: 50px 0 }
        .swagger-ui .scheme-container { background: #fafafa; padding: 20px 0 }
      `,
    });

    await app.listen(port);

    logger.log(`Application is running on: http://localhost:${port}`);
    logger.log(`API Documentation: http://localhost:${port}/api/docs`);
    logger.log(`Frontend URL: ${frontendUrl}`);
    logger.log(`Environment: ${configService.get<string>('nodeEnv')}`);
    logger.log(`Swagger JSON: http://localhost:${port}/api/docs-json`);
  } catch (error) {
    logger.error(
      'Error starting the application:',
      error instanceof Error ? error.stack : String(error),
    );
    process.exit(1);
  }
}

bootstrap().catch((error) => {
  console.error('Fatal error during bootstrap:', error);
  process.exit(1);
});
