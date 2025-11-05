/**
 * AppModule - Módulo Raiz da Aplicação
 *
 * Este é o módulo principal que orquestra toda a aplicação NestJS.
 * Responsável por:
 * - Importar e configurar todos os módulos da aplicação
 * - Configurar rate limiting global
 * - Definir a ordem de inicialização dos módulos
 *
 * Ordem de importação dos módulos:
 * 1. ConfigModule: Carrega variáveis de ambiente (deve ser primeiro)
 * 2. PrismaModule: Estabelece conexão com banco de dados
 * 3. ThrottlerModule: Configura rate limiting global
 * 4. Módulos de negócio: Auth, Sites, SDK, Events, Insights, Health
 *
 * Dependências entre módulos:
 * - Todos os módulos dependem de PrismaModule (exceto ConfigModule)
 * - Auth, Sites, Events, Insights dependem de ConfigModule
 * - SdkModule depende de SitesModule
 * - UnifiedGuard (usado em todos os controllers) depende de AuthModule e PrismaModule
 */

import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from './config/config.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { SitesModule } from './sites/sites.module';
import { SdkModule } from './sdk/sdk.module';
import { EventsModule } from './events/events.module';
import { InsightsModule } from './insights/insights.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    // ConfigModule: SEMPRE PRIMEIRO - Carrega variáveis de ambiente (.env)
    // Usado por todos os outros módulos que precisam de configuração
    ConfigModule,

    // PrismaModule: SEGUNDO - Estabelece conexão com PostgreSQL
    // Fornece PrismaService para todos os módulos que precisam acessar o banco
    PrismaModule,

    // ThrottlerModule: Rate limiting global
    // Limita requisições para prevenir abuso e ataques DDoS
    // Configuração: 100 requisições por minuto por IP
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // Time to live: 1 minuto (60000ms)
        limit: 100, // Máximo de 100 requisições neste período
      },
    ]),

    // AuthModule: Autenticação e gerenciamento de sessões
    // Endpoints: /api/auth/login, /api/auth/register, /api/auth/logout, /api/auth/me
    AuthModule,

    // SitesModule: CRUD de sites e domínios (multi-tenancy)
    // Endpoints: /api/sites/* e /api/sites/:id/domains
    SitesModule,

    // SdkModule: Serve o SDK JavaScript e configurações para clientes
    // Endpoints: /api/sdk/loader, /api/sdk/site-config
    // Depende de SitesModule para buscar informações dos sites
    SdkModule,

    // EventsModule: Ingestão de eventos de analytics
    // Endpoints: /api/events/track, /api/events/track/batch
    // Protegido por UnifiedGuard com @RequireTenant() (valida X-Site-Key)
    EventsModule,

    // InsightsModule: Queries de analytics e geração de insights
    // Endpoints: /api/insights/overview, /api/insights/conversions, etc
    // Protegido por UnifiedGuard com @RequireTenant(), usa cache em memória
    InsightsModule,

    // HealthModule: Health checks e monitoramento
    // Endpoints: /api/health, /api/health/db
    HealthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
