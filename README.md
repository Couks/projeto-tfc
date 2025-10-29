# Arquitetura do Sistema InsightHouse

## Visão Geral

O InsightHouse é uma plataforma de analytics web multi-tenant construída com NestJS, que permite rastreamento de eventos, análise de comportamento de usuários e geração de insights para sites imobiliários.

## Diagrama de Arquitetura

```mermaid
graph TB
    subgraph "Cliente Externo"
        Browser[Navegador do Usuário]
        SDK[SDK JavaScript]
    end

    subgraph "Frontend Admin"
        NextJS[Next.js App Router]
        ReactQuery[React Query Cache]
    end

    subgraph "Backend NestJS - Entry Point"
        Main[main.ts<br/>Bootstrap]
        AppModule[App Module<br/>Módulo Raiz]
    end

    subgraph "Middlewares Globais"
        Helmet[Helmet<br/>Security Headers]
        CORS[CORS<br/>Cross-Origin]
        Compression[Compression<br/>Gzip]
        CookieParser[Cookie Parser]
        ValidationPipe[Validation Pipe<br/>DTOs]
        Throttler[Rate Limiting<br/>100 req/min]
    end

    subgraph "Guards - Camada de Segurança"
        AuthGuard[AuthGuard<br/>Valida Session Cookie]
        TenantGuard[TenantGuard<br/>Valida Site Key]
    end

    subgraph "Interceptors"
        LoggingInterceptor[Logging Interceptor<br/>Request/Response Log]
    end

    subgraph "Controllers - Camada de Roteamento"
        AuthController[Auth Controller<br/>/api/auth/*]
        SitesController[Sites Controller<br/>/api/sites/*]
        EventsController[Events Controller<br/>/api/events/*]
        InsightsController[Insights Controller<br/>/api/insights/*]
        SdkController[SDK Controller<br/>/api/sdk/*]
        HealthController[Health Controller<br/>/api/health]
    end

    subgraph "Services - Camada de Negócio"
        AuthService[Auth Service<br/>Login, Register, Session]
        SitesService[Sites Service<br/>CRUD Sites & Domains]
        EventsService[Events Service<br/>Ingestão & Enriquecimento]
        InsightsService[Insights Service<br/>Queries SQL & Cache]
        SdkService[SDK Service<br/>Config & Loader]
        HealthService[Health Service<br/>Status Checks]
    end

    subgraph "Módulos Core"
        PrismaModule[Prisma Module<br/>Database Connection]
        ConfigModule[Config Module<br/>Environment Vars]
    end

    subgraph "Utils & Decorators"
        AuthUtils[Auth Utils<br/>Hash, Verify, Sign]
        SiteKeyUtils[Site Key Utils<br/>Generate, Validate]
        CurrentUserDec[CurrentUser<br/>Decorator]
        SiteKeyDec[SiteKey<br/>Decorator]
    end

    subgraph "Database"
        PostgreSQL[(PostgreSQL<br/>Events, Users, Sites)]
    end

    subgraph "Cache"
        MemoryCache[In-Memory LRU Cache<br/>TTL: 2 min]
    end

    %% Fluxos principais
    Browser -->|1. Carregar SDK| SDK
    SDK -->|2. Track Events| EventsController
    NextJS -->|3. API Calls| AuthController
    NextJS -->|4. API Calls| SitesController
    NextJS -->|5. API Calls| InsightsController

    %% Entry Point
    Main --> AppModule
    AppModule --> ConfigModule
    AppModule --> PrismaModule
    AppModule --> Throttler

    %% Middleware Flow
    EventsController -->|passa por| Helmet
    Helmet --> CORS
    CORS --> Compression
    Compression --> CookieParser
    CookieParser --> ValidationPipe
    ValidationPipe --> LoggingInterceptor

    %% Guard Flow
    AuthController -.->|protegido por| AuthGuard
    SitesController -.->|protegido por| AuthGuard
    EventsController -.->|protegido por| TenantGuard
    InsightsController -.->|protegido por| TenantGuard

    %% Controller to Service
    AuthController --> AuthService
    SitesController --> SitesService
    EventsController --> EventsService
    InsightsController --> InsightsService
    SdkController --> SdkService
    HealthController --> HealthService

    %% Service to Database
    AuthService --> PrismaModule
    SitesService --> PrismaModule
    EventsService --> PrismaModule
    InsightsService --> PrismaModule
    SdkService --> PrismaModule
    HealthService --> PrismaModule

    %% Database Connection
    PrismaModule --> PostgreSQL

    %% Cache
    InsightsService -.->|usa| MemoryCache

    %% Utils
    AuthService -.->|usa| AuthUtils
    SitesService -.->|usa| SiteKeyUtils
    AuthGuard -.->|usa| AuthUtils
    TenantGuard -.->|usa| PrismaModule

    %% Decorators
    AuthController -.->|usa| CurrentUserDec
    EventsController -.->|usa| SiteKeyDec

    style Main fill:#e1f5ff
    style AuthGuard fill:#ffe1e1
    style TenantGuard fill:#ffe1e1
    style PostgreSQL fill:#e1ffe1
    style MemoryCache fill:#fff3e1
```

## Fluxos de Dados Principais

### 1. Fluxo de Autenticação

```mermaid
sequenceDiagram
    participant User as Usuário
    participant Frontend as Next.js Frontend
    participant AuthController as Auth Controller
    participant AuthGuard as Auth Guard
    participant AuthService as Auth Service
    participant DB as PostgreSQL

    User->>Frontend: 1. Envia credenciais
    Frontend->>AuthController: 2. POST /api/auth/login
    AuthController->>AuthService: 3. login(email, password)
    AuthService->>DB: 4. Busca usuário
    DB-->>AuthService: 5. Retorna usuário
    AuthService->>AuthService: 6. Verifica senha (scrypt)
    AuthService->>AuthService: 7. Cria session assinada (HMAC-SHA256)
    AuthService-->>AuthController: 8. Retorna session cookie
    AuthController-->>Frontend: 9. Set-Cookie: admin_session
    Frontend->>AuthController: 10. GET /api/auth/me (com cookie)
    AuthController->>AuthGuard: 11. Valida session
    AuthGuard->>AuthGuard: 12. Verifica assinatura HMAC
    AuthGuard-->>AuthController: 13. Autorizado (userId)
    AuthController->>AuthService: 14. me(userId)
    AuthService->>DB: 15. Busca dados do usuário
    DB-->>AuthService: 16. Retorna dados
    AuthService-->>AuthController: 17. Retorna usuário
    AuthController-->>Frontend: 18. JSON com dados
```

### 2. Fluxo de Tracking de Eventos

```mermaid
sequenceDiagram
    participant Browser as Navegador
    participant SDK as SDK JavaScript
    participant EventsController as Events Controller
    participant TenantGuard as Tenant Guard
    participant EventsService as Events Service
    participant DB as PostgreSQL

    Browser->>SDK: 1. Usuário interage (clique, scroll, etc)
    SDK->>SDK: 2. Adiciona evento à fila
    SDK->>SDK: 3. Espera 3s ou 10 eventos
    SDK->>EventsController: 4. POST /api/events/track/batch<br/>Header: X-Site-Key
    EventsController->>TenantGuard: 5. Valida siteKey
    TenantGuard->>DB: 6. Busca site pelo siteKey
    DB-->>TenantGuard: 7. Retorna site e domínios
    TenantGuard->>TenantGuard: 8. Verifica status = 'active'
    TenantGuard-->>EventsController: 9. Autorizado (tenant info)
    EventsController->>EventsService: 10. ingestBatch(siteKey, events)
    EventsService->>EventsService: 11. Enriquece com dados server-side<br/>(IP anônimo, userAgent, timestamp)
    EventsService->>DB: 12. Batch insert (chunks de 100)
    DB-->>EventsService: 13. Confirmação
    EventsService-->>EventsController: 14. {success: true, count: N}
    EventsController-->>SDK: 15. 200 OK
```

### 3. Fluxo de Analytics (Insights)

```mermaid
sequenceDiagram
    participant Frontend as Next.js Frontend
    participant InsightsController as Insights Controller
    participant TenantGuard as Tenant Guard
    participant InsightsService as Insights Service
    participant Cache as Memory Cache
    participant DB as PostgreSQL

    Frontend->>InsightsController: 1. GET /api/insights/overview?site=KEY
    InsightsController->>TenantGuard: 2. Valida siteKey
    TenantGuard->>DB: 3. Busca site
    DB-->>TenantGuard: 4. Site válido
    TenantGuard-->>InsightsController: 5. Autorizado
    InsightsController->>InsightsService: 6. getOverview(siteKey)
    InsightsService->>Cache: 7. Busca no cache
    alt Cache Hit
        Cache-->>InsightsService: 8a. Retorna dados em cache
    else Cache Miss
        Cache-->>InsightsService: 8b. Cache vazio/expirado
        InsightsService->>DB: 9. Executa queries SQL paralelas<br/>(12 queries agregando JSONB)
        DB-->>InsightsService: 10. Retorna resultados
        InsightsService->>InsightsService: 11. Converte BigInt para Number
        InsightsService->>Cache: 12. Armazena em cache (TTL: 2 min)
    end
    InsightsService-->>InsightsController: 13. Retorna dados
    InsightsController-->>Frontend: 14. JSON com analytics
```

### 4. Fluxo de Multi-Tenancy (Criação de Site)

```mermaid
sequenceDiagram
    participant Frontend as Next.js Frontend
    participant SitesController as Sites Controller
    participant AuthGuard as Auth Guard
    participant SitesService as Sites Service
    participant DB as PostgreSQL

    Frontend->>SitesController: 1. POST /api/sites<br/>{name, domain}
    SitesController->>AuthGuard: 2. Valida session cookie
    AuthGuard-->>SitesController: 3. Autorizado (userId)
    SitesController->>SitesService: 4. create(userId, data)
    SitesService->>SitesService: 5. Valida FQDN do domínio
    SitesService->>DB: 6. Verifica se domínio já existe
    DB-->>SitesService: 7. Domínio disponível
    SitesService->>SitesService: 8. Gera siteKey único (nanoid)
    SitesService->>DB: 9. Cria site + domínio (transação)
    DB-->>SitesService: 10. Site criado
    SitesService-->>SitesController: 11. Retorna site com siteKey
    SitesController-->>Frontend: 12. JSON com site e loader URL
```

## Módulos e Responsabilidades

### Módulos Core

| Módulo | Responsabilidade | Dependências |
|--------|-----------------|--------------|
| **AppModule** | Módulo raiz, orquestra todos os outros | Todos os módulos |
| **ConfigModule** | Gerencia variáveis de ambiente | Nenhuma |
| **PrismaModule** | Conexão singleton com PostgreSQL | ConfigModule |

### Módulos de Negócio

| Módulo | Responsabilidade | Dependências |
|--------|-----------------|--------------|
| **AuthModule** | Autenticação, registro, sessões | PrismaModule, ConfigModule |
| **SitesModule** | CRUD de sites e domínios, multi-tenancy | PrismaModule |
| **EventsModule** | Ingestão de eventos, enriquecimento | PrismaModule |
| **InsightsModule** | Analytics, queries SQL, cache | PrismaModule, ConfigModule |
| **SdkModule** | Servir SDK JavaScript e configurações | SitesModule |
| **HealthModule** | Health checks e monitoramento | PrismaModule |

### Guards (Segurança)

| Guard | Quando Aplica | O Que Faz |
|-------|---------------|-----------|
| **AuthGuard** | Rotas protegidas do admin | Valida session cookie HMAC-SHA256 |
| **TenantGuard** | Rotas multi-tenant (events, insights) | Valida siteKey e verifica status do site |

### Interceptors

| Interceptor | Função |
|-------------|--------|
| **LoggingInterceptor** | Loga todas as requests/responses com duração |

### Decorators Customizados

| Decorator | Função |
|-----------|--------|
| **@CurrentUser()** | Extrai `userId` da session no request |
| **@SiteKey()** | Extrai `siteKey` do tenant info no request |

## Camadas da Aplicação

```
┌─────────────────────────────────────────┐
│         Entry Point (main.ts)           │
│  - Bootstrap da aplicação               │
│  - Configuração de middlewares          │
│  - Swagger setup                        │
└─────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────┐
│      Middlewares Globais                │
│  - Helmet (security headers)            │
│  - CORS (cross-origin)                  │
│  - Compression (gzip)                   │
│  - Cookie Parser                        │
│  - Validation Pipe (DTOs)               │
│  - Rate Limiting (throttler)            │
└─────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────┐
│      Guards (Segurança)                 │
│  - AuthGuard: valida sessão             │
│  - TenantGuard: valida siteKey          │
└─────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────┐
│      Interceptors                       │
│  - Logging: registra req/res            │
└─────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────┐
│      Controllers (Rotas REST)           │
│  - Recebe requisições HTTP              │
│  - Valida DTOs                          │
│  - Chama services                       │
│  - Retorna respostas                    │
└─────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────┐
│      Services (Lógica de Negócio)       │
│  - Processa dados                       │
│  - Aplica regras de negócio             │
│  - Interage com banco                   │
│  - Cache e otimizações                  │
└─────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────┐
│      Prisma (ORM)                       │
│  - Type-safe database client            │
│  - Migrations                           │
│  - Query builder                        │
└─────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────┐
│      PostgreSQL Database                │
│  - Users, Sites, Domains                │
│  - Events (JSONB para flexibilidade)    │
│  - Settings                             │
└─────────────────────────────────────────┘
```

## Segurança

### Autenticação
- **Método**: Session cookies assinados com HMAC-SHA256
- **Storage**: Cookie `admin_session` HttpOnly
- **Hashing**: Senhas com scrypt (Node.js built-in)
- **Validação**: Comparação constant-time (timingSafeEqual)

### Multi-Tenancy
- **Identificação**: Header `X-Site-Key` ou query param `site`
- **Validação**: TenantGuard verifica existência e status
- **Isolamento**: Todos os dados filtrados por `siteKey`

### Rate Limiting
- **Global**: 100 requests/minuto por IP
- **Events**: 1000 requests/minuto por siteKey

### Proteção de Dados
- **IP Anonymization**: Último octeto IPv4 zerado (LGPD/GDPR)
- **CORS**: Apenas origins autorizados
- **Helmet**: Security headers automáticos
- **Validation**: DTOs com class-validator

## Performance

### Cache
- **Tipo**: In-memory LRU
- **TTL**: 2 minutos para insights
- **Limpeza**: Automática quando > 1000 entradas

### Batch Processing
- **Events**: Aceita até 500 eventos por batch
- **Chunking**: Inserções em blocos de 100
- **Otimização**: Queries SQL paralelas (Promise.all)

### Database
- **Indexes**: Otimizados para queries frequentes
- **JSONB**: Busca eficiente em propriedades dinâmicas
- **Connection Pool**: Gerenciado automaticamente pelo Prisma

## Tecnologias

- **Framework**: NestJS 10.x
- **Language**: TypeScript 5.x (strict mode)
- **ORM**: Prisma 5.x
- **Database**: PostgreSQL 16
- **Validation**: class-validator + class-transformer
- **Documentation**: Swagger/OpenAPI 3.0
- **Security**: Helmet, CORS, Rate Limiting
- **Authentication**: Session cookies (HMAC-SHA256)
- **Password Hashing**: scrypt (Node.js built-in)

## Próximos Passos (Escalabilidade)

1. **Redis Cache**: Substituir in-memory por Redis distribuído
2. **Queue System**: Bull/BullMQ para processamento assíncrono de eventos
3. **Database Partitioning**: Particionar tabela Events por data
4. **Read Replicas**: Separar leitura (insights) de escrita (events)
5. **CDN**: Servir SDK JavaScript via CDN
6. **WebSockets**: Real-time analytics dashboard
7. **Aggregations**: Tabelas pré-calculadas para queries pesadas

