# Documentação Completa do Código - InsightHouse Backend

Este documento consolida a explicação detalhada de cada componente do sistema, como eles se conectam e para que servem.

## Índice
1. [Guards - Camada de Segurança](#guards)
2. [Decorators Customizados](#decorators)
3. [Utils - Funções Utilitárias](#utils)
4. [Módulos de Negócio](#modulos)

---

## Guards - Camada de Segurança <a name="guards"></a>

### AuthGuard (`back/src/common/guards/auth.guard.ts`)

**O que faz:**
Protege rotas que requerem autenticação, validando o cookie de sessão.

**Como funciona:**
1. Extrai o cookie `admin_session` da requisição
2. Verifica a assinatura HMAC-SHA256 do cookie
3. Usa `timingSafeEqual` para comparação constant-time (segurança)
4. Extrai o `userId` da sessão
5. Anexa `authSession` ao objeto `request`

**Quando é aplicado:**
- Todas as rotas em `AuthController` que precisam de autenticação
- Todas as rotas em `SitesController` (CRUD de sites)
- Qualquer endpoint decorado com `@UseGuards(AuthGuard)`

**Dependências:**
- ConfigService: Para obter o secret de assinatura
- crypto (Node.js): Para verificar HMAC-SHA256

**Fluxo:**
```
Request → AuthGuard → Valida Cookie → Extrai userId → Anexa authSession → Próximo
```

**Código chave:**
```typescript
// Verifica assinatura HMAC com comparação constant-time
const isValid = crypto.timingSafeEqual(
  Buffer.from(sig),
  Buffer.from(check),
);
```

---

### TenantGuard (`back/src/common/guards/tenant.guard.ts`)

**O que faz:**
Implementa multi-tenancy validando o `siteKey` em cada requisição.

**Como funciona:**
1. Extrai `siteKey` do header `X-Site-Key` OU query param `site`
2. Busca o site no banco de dados pelo `siteKey`
3. Verifica se o site existe e está ativo (`status = 'active'`)
4. Carrega os domínios permitidos do site
5. Anexa informações do tenant ao objeto `request`

**Quando é aplicado:**
- `EventsController`: Para validar eventos vindos do SDK
- `InsightsController`: Para garantir que apenas dados do site correto são acessados
- `SdkController`: Para servir configuração correta do site

**Dependências:**
- PrismaService: Para buscar informações do site

**Fluxo:**
```
Request → TenantGuard → Extrai siteKey → Busca no DB → Valida Status → Anexa tenant → Próximo
```

**Por que é importante:**
- **Isolamento de dados**: Garante que um site não acesse dados de outro
- **Segurança**: Previne que sites inativos/suspensos processem eventos
- **Multi-tenancy**: Permite múltiplos clientes na mesma aplicação

---

## Decorators Customizados <a name="decorators"></a>

### @CurrentUser (`back/src/common/decorators/current-user.decorator.ts`)

**O que faz:**
Extrai o `userId` da sessão do request de forma type-safe.

**Como funciona:**
```typescript
@Get('me')
@UseGuards(AuthGuard)
async me(@CurrentUser() userId: string) {
  // userId já está disponível diretamente
}
```

**Internamente:**
```typescript
// Busca authSession que foi anexado pelo AuthGuard
const session = request.authSession;
return session?.userId;
```

**Usado em:**
- AuthController: Para obter dados do usuário logado
- SitesController: Para filtrar sites pelo dono

---

### @SiteKey (`back/src/common/decorators/site-key.decorator.ts`)

**O que faz:**
Extrai o `siteKey` das informações do tenant do request.

**Como funciona:**
```typescript
@Post('track')
@UseGuards(TenantGuard)
async track(@SiteKey() siteKey: string, @Body() dto: TrackEventDto) {
  // siteKey já está disponível e validado
}
```

**Internamente:**
```typescript
// Busca tenant que foi anexado pelo TenantGuard
const tenant = request.tenant;
return tenant?.siteKey;
```

**Usado em:**
- EventsController: Para saber em qual site salvar eventos
- InsightsController: Para filtrar analytics por site

---

## Utils - Funções Utilitárias <a name="utils"></a>

### auth.utils.ts

**hashPassword(password: string): Promise<string>**
- Usa scrypt (Node.js built-in) para hashear senhas
- Salt de 16 bytes aleatório
- Key length de 64 bytes
- Retorna hash no formato: `salt.hash` (ambos em hex)

**verifyPassword(password: string, hash: string): Promise<boolean>**
- Separa salt e hash armazenados
- Re-hasheia a senha fornecida com o mesmo salt
- Compara usando `timingSafeEqual` (constant-time)

**signSession(data: SessionData, secret: string): string**
- Serializa dados em JSON
- Cria assinatura HMAC-SHA256
- Retorna no formato: `data.signature`

**Por que scrypt?**
- Resistente a ataques de GPU/ASIC
- Built-in no Node.js (não precisa de libs externas)
- Automaticamente ajusta complexidade

---

### site-key.utils.ts

**generateSiteKey(): string**
- Usa nanoid para gerar ID único
- Formato: `site_` + 24 caracteres aleatórios
- URL-safe (não precisa encoding)
- Colisão praticamente impossível

**isValidFqdn(domain: string): boolean**
- Valida formato de domínio (FQDN)
- Regex: aceita subdomínios, TLDs
- Exemplos válidos: `example.com`, `www.example.com`, `sub.domain.example.com`
- Rejeita: IPs, localhost, domínios inválidos

---

## Módulos de Negócio <a name="modulos"></a>

### AuthModule

**Arquitetura:**
```
AuthController → AuthService → PrismaService → PostgreSQL
                      ↓
              AuthGuard (valida sessões)
```

**AuthService - Responsabilidades:**

1. **login(loginDto: LoginDto): Promise<string>**
   - Busca usuário por email no banco
   - Verifica senha usando `verifyPassword`
   - Atualiza `lastLoginAt`
   - Cria session assinada com HMAC
   - Retorna cookie serializado

2. **register(registerDto: RegisterDto): Promise<string>**
   - Verifica se email já existe
   - Hasheia senha com scrypt
   - Cria usuário no banco
   - Cria session automaticamente
   - Retorna cookie serializado

3. **me(userId: string): Promise<User>**
   - Busca dados completos do usuário
   - Remove campos sensíveis (passwordHash)
   - Retorna para o frontend

**Fluxo de Login:**
```
1. Frontend envia POST /api/auth/login {email, password}
2. AuthController recebe requisição
3. AuthService valida credenciais
4. AuthService gera session assinada
5. Controller seta cookie HttpOnly
6. Frontend recebe 200 OK
7. Próximas requisições enviam cookie automaticamente
8. AuthGuard valida cookie em rotas protegidas
```

**Segurança:**
- Senha nunca retorna em responses
- Cookie HttpOnly (não acessível via JS)
- Cookie Secure em produção (apenas HTTPS)
- SameSite=lax (proteção CSRF)
- Session assinada com HMAC-SHA256

---

### SitesModule

**Arquitetura:**
```
SitesController → SitesService → PrismaService → PostgreSQL
      ↓                              ↓
  AuthGuard              site-key.utils (generate, validate)
```

**SitesService - Responsabilidades:**

1. **create(userId: string, createSiteDto): Promise<Site>**
   - Valida FQDN do domínio
   - Verifica se domínio já está em uso
   - Gera `siteKey` único com nanoid
   - Cria site E domínio em transação
   - Retorna site completo

2. **findAll(userId: string): Promise<Site[]>**
   - Lista todos os sites do usuário
   - Inclui domínios associados
   - Ordena por criação (mais recentes primeiro)

3. **findOne(id: string, userId: string): Promise<Site>**
   - Busca site específico
   - Valida ownership (só dono pode acessar)
   - Inclui domínios e settings

4. **findBySiteKey(siteKey: string): Promise<Site>**
   - Usado pelo TenantGuard
   - Busca site pelo siteKey (não por ID)
   - Inclui domínios (para validação de origem)

5. **addDomain(...): Promise<Domain>**
   - Adiciona domínio adicional ao site
   - Se isPrimary=true, remove primary de outros
   - Valida FQDN e unicidade

**Conceitos importantes:**

**Multi-tenancy:**
- Cada site tem `siteKey` único
- Sites isolados por `userId` (dono)
- Eventos/insights filtrados por `siteKey`

**Domínios:**
- Cada site pode ter múltiplos domínios
- Um domínio é marcado como `isPrimary`
- Usado para validar origem dos eventos
- Não pode deletar o último domínio

**Fluxo de Criação:**
```
1. Usuário preenche form (name, domain)
2. POST /api/sites
3. AuthGuard valida sessão
4. SitesService valida FQDN
5. Gera siteKey único
6. Cria site + domínio (transação)
7. Retorna site com siteKey
8. Frontend exibe snippet com siteKey
```

---

### EventsModule

**Arquitetura:**
```
SDK JavaScript → POST /api/events/track/batch → EventsController
                            ↓
                      TenantGuard (valida siteKey)
                            ↓
                      EventsService
                            ↓
                   Enriquecimento server-side
                            ↓
                      Batch Insert (chunks)
                            ↓
                      PostgreSQL (tabela Event)
```

**EventsService - Responsabilidades:**

1. **ingest(siteKey, eventDto, metadata): Promise<{id, success}>**
   - Valida nome do evento
   - Enriquece com dados server-side:
     - `serverTs`: Timestamp do servidor
     - `ip`: IP anonimizado (último octeto zerado)
     - `userAgent`: User agent do navegador
   - Insere evento no banco
   - Retorna confirmação

2. **ingestBatch(siteKey, events[], metadata): Promise<{success, count}>**
   - Aceita até 500 eventos por batch
   - Enriquece todos os eventos
   - Divide em chunks de 100 (para performance)
   - Insere com `createMany` (otimizado)
   - Retorna quantidade inserida

3. **anonymizeIp(ip: string): string**
   - IPv4: Zera último octeto (192.168.1.0)
   - IPv6: Mantém primeiros 48 bits
   - LGPD/GDPR compliance

**Por que batch?**
- **Performance**: 1 request HTTP para N eventos
- **Menos latência**: Não bloqueia UI do usuário
- **Menos carga**: Menos conexões HTTP
- **Chunking**: Evita timeouts em batches grandes

**Enriquecimento server-side:**
```typescript
const enrichedContext = {
  ...context, // Dados do cliente
  serverTs: new Date().toISOString(), // Timestamp confiável
  ip: this.anonymizeIp(metadata.ip), // IP anonimizado
  userAgent: metadata.userAgent, // Para analytics
};
```

**Fluxo de Tracking:**
```
1. Usuário interage com site (clique, scroll, etc)
2. SDK adiciona evento à fila
3. Após 3s OU 10 eventos, flush automático
4. SDK envia POST /api/events/track/batch
5. Header X-Site-Key enviado
6. TenantGuard valida siteKey
7. EventsService enriquece eventos
8. Batch insert no PostgreSQL
9. SDK recebe 200 OK
10. Fila limpa, pronto para próximos eventos
```

**Rate Limiting:**
- Global: 100 req/min por IP
- Events específico: 1000 req/min por siteKey
- Previne abuso e spam

---

### InsightsModule

**Arquitetura:**
```
Frontend → GET /api/insights/overview?site=KEY
              ↓
        TenantGuard (valida siteKey)
              ↓
        InsightsService
              ↓
         Cache LRU (chave: siteKey+query, TTL: 2min)
              ↓
    Hit? → Retorna cache
    Miss? ↓
         Queries SQL (PostgreSQL)
              ↓
    Agrega dados JSONB
              ↓
     Salva em cache → Retorna
```

**InsightsService - Responsabilidades:**

1. **getOverview(siteKey): Promise<OverviewData>**
   - Executa 12 queries SQL em paralelo (Promise.all)
   - Cada query agrega um aspecto:
     - Finalidades: venda, aluguel, etc
     - Tipos: apartamento, casa, etc
     - Cidades: mais buscadas
     - Bairros: mais buscados
     - Faixas de preço: ranges customizados
     - Características: dormitórios, suítes, vagas, etc
   - Converte BigInt para Number (JSON compatibility)
   - Retorna objeto estruturado

2. **getConversions(siteKey): Promise<ConversionsData>**
   - Busca eventos de conversão (conversion_*)
   - Agrupa por tipo: whatsapp, phone, email, form
   - Calcula funil de conversão:
     - Session Start → Search → Property View → Conversion
   - Conta sessões únicas por etapa

3. **getJourneys(siteKey): Promise<JourneysData>**
   - Analisa comportamento do usuário:
     - Page depth: quantas páginas visitou
     - Scroll depth: quanto scrollou
     - Time on page: tempo em cada página
     - Visitor type: novo vs retornando
   - Agrupa em ranges (0-10s, 10-30s, etc)

4. **getTopCities(siteKey): Promise<City[]>**
   - Lista top 20 cidades mais buscadas
   - Ordena por quantidade de buscas
   - Usado para insights geográficos

**Sistema de Cache:**

```typescript
// Estrutura da cache
cache: Map<string, {data: any, expiresAt: number}>

// Chave de cache
const cacheKey = `overview:${siteKey}`;

// Verificação
if (cached && cached.expiresAt > Date.now()) {
  return cached.data; // Cache hit
}

// Cache miss → executa query → salva
```

**Por que cache?**
- Queries SQL são pesadas (agregações em JSONB)
- Dados não mudam a cada segundo
- TTL de 2 minutos é bom equilíbrio
- Reduz carga no banco significativamente

**Queries JSONB:**
```sql
-- Exemplo: Buscar tipos de imóveis mais buscados
SELECT
  properties->>'value' AS tipo,
  COUNT(*) AS total
FROM "Event"
WHERE "siteKey" = $1
  AND name = 'search_filter_changed'
  AND properties->>'field' = 'tipo'
GROUP BY properties->>'value'
ORDER BY total DESC
LIMIT 20
```

**Por que JSONB?**
- Flexível: Cada evento pode ter propriedades diferentes
- Performático: PostgreSQL indexa JSONB
- Queries: Operador `->` e `->>` para acessar campos
- Não precisa alterar schema para novos campos

---

### SDKModule

**Arquitetura:**
```
Cliente → GET /api/sdk/loader?site=KEY
             ↓
       TenantGuard (valida siteKey)
             ↓
       SdkService
             ↓
    Gera script JavaScript
             ↓
    Retorna com Content-Type: application/javascript
             ↓
    Cliente executa script
             ↓
    Carrega capture-filters.js
             ↓
    Inicializa tracking
```

**SdkService - Responsabilidades:**

1. **getLoader(siteKey): Promise<string>**
   - Gera script loader inline
   - Injeta `siteKey` no código
   - Injeta `API_URL` do backend
   - Retorna JavaScript pronto para executar
   - Cliente carrega `capture-filters.js`

2. **getSiteConfig(siteKey): Promise<SiteConfig>**
   - Busca site pelo siteKey
   - Retorna configurações:
     - `allowedDomains`: Lista de domínios autorizados
     - `consentDefault`: Configuração de consentimento
     - `apiHost`: URL da API
   - Usado pelo SDK para validar origem
   - Previne uso não autorizado

**Fluxo de Instalação:**

```html
<!-- Cliente adiciona snippet no site -->
<script async src="https://api.insighthouse.com/api/sdk/loader?site=site_abc123"></script>
```

```
1. Browser carrega script loader
2. Loader executa e faz fetch de site-config
3. Valida se domínio atual está em allowedDomains
4. Se válido, carrega capture-filters.js
5. SDK inicializa tracking
6. Eventos começam a ser coletados
```

**Segurança:**
- `allowedDomains` previne uso não autorizado
- `siteKey` é validado pelo TenantGuard
- Cross-origin validado pelo SDK
- Rate limiting previne abuso

---

### HealthModule

**Arquitetura:**
```
Monitoring Tool → GET /api/health
                      ↓
                HealthController
                      ↓
                HealthService
                      ↓
           Check: App + Database
                      ↓
              Retorna Status JSON
```

**HealthService - Responsabilidades:**

1. **check(): HealthStatus**
   - Retorna status básico da aplicação
   - Informações:
     - `status`: 'ok'
     - `timestamp`: Data/hora atual
     - `uptime`: Tempo desde boot (segundos)
     - `environment`: development/production

2. **checkDatabase(): Promise<DatabaseHealthStatus>**
   - Executa query simples: `SELECT 1`
   - Se sucesso: `{status: 'ok', database: 'connected'}`
   - Se falha: `{status: 'error', database: 'disconnected', error: ...}`

**Uso:**
- Monitoring tools (Uptime Robot, etc)
- Health checks do Docker/Kubernetes
- Debug durante desenvolvimento
- Verificar se app está respondendo

**Endpoints:**
- `GET /api/health`: Status básico
- `GET /api/health/db`: Status do banco

---

## Fluxos Completos End-to-End

### 1. Fluxo Completo de Autenticação

```
┌─────────┐         ┌──────────┐         ┌────────────┐         ┌──────────┐
│ Usuario │         │ Frontend │         │  Backend   │         │ Database │
└────┬────┘         └─────┬────┘         └──────┬─────┘         └─────┬────┘
     │                    │                     │                      │
     │ 1. Preenche form   │                     │                      │
     ├───────────────────>│                     │                      │
     │                    │ 2. POST /auth/login │                      │
     │                    ├────────────────────>│                      │
     │                    │                     │ 3. SELECT user       │
     │                    │                     ├─────────────────────>│
     │                    │                     │<─────────────────────┤
     │                    │                     │ 4. Verifica senha    │
     │                    │                     │    (scrypt compare)  │
     │                    │                     │ 5. UPDATE lastLogin  │
     │                    │                     ├─────────────────────>│
     │                    │                     │ 6. Cria session      │
     │                    │                     │    (HMAC sign)       │
     │                    │ 7. Set-Cookie       │                      │
     │                    │<────────────────────┤                      │
     │ 8. Redireciona     │                     │                      │
     │<───────────────────┤                     │                      │
     │                    │                     │                      │
     │ 9. GET /auth/me    │                     │                      │
     │    (com cookie)    │                     │                      │
     ├───────────────────>│─────────────────────>                      │
     │                    │                     │ AuthGuard valida     │
     │                    │                     │ SELECT user          │
     │                    │                     ├─────────────────────>│
     │                    │ Dados do usuario    │<─────────────────────┤
     │<───────────────────┤<────────────────────┤                      │
```

### 2. Fluxo Completo de Tracking de Eventos

```
┌──────────┐     ┌─────────┐     ┌────────────┐     ┌──────────┐     ┌──────────┐
│ Usuario  │     │   SDK   │     │ Controller │     │ Service  │     │ Database │
└────┬─────┘     └────┬────┘     └─────┬──────┘     └────┬─────┘     └────┬─────┘
     │                │                 │                 │                │
     │ 1. Clica botão │                 │                 │                │
     ├───────────────>│                 │                 │                │
     │                │ 2. Queue event  │                 │                │
     │                │    {name, props}│                 │                │
     │                │ 3. Aguarda 3s   │                 │                │
     │                │    ou 10 events │                 │                │
     │                │ 4. POST /events │                 │                │
     │                │    /track/batch │                 │                │
     │                ├────────────────>│                 │                │
     │                │                 │ TenantGuard     │                │
     │                │                 │ valida siteKey  │                │
     │                │                 ├────────────────>│                │
     │                │                 │                 │ 5. Enriquece   │
     │                │                 │                 │    serverTs    │
     │                │                 │                 │    IP anônimo  │
     │                │                 │                 │ 6. Batch insert│
     │                │                 │                 ├───────────────>│
     │                │                 │                 │<───────────────┤
     │                │ 7. 200 OK       │<────────────────┤                │
     │                │<────────────────┤                 │                │
     │                │ 8. Limpa queue  │                 │                │
```

### 3. Fluxo Completo de Analytics

```
┌─────────┐     ┌──────────┐     ┌────────────┐     ┌─────────┐     ┌──────────┐
│ Admin   │     │ Frontend │     │ Controller │     │ Service │     │ Database │
└────┬────┘     └────┬─────┘     └─────┬──────┘     └────┬────┘     └────┬─────┘
     │               │                  │                 │                │
     │ 1. Abre dash  │                  │                 │                │
     ├──────────────>│                  │                 │                │
     │               │ 2. GET /insights │                 │                │
     │               │    /overview     │                 │                │
     │               │    ?site=KEY     │                 │                │
     │               ├─────────────────>│                 │                │
     │               │                  │ TenantGuard     │                │
     │               │                  │ valida siteKey  │                │
     │               │                  ├────────────────>│                │
     │               │                  │                 │ 3. Check cache │
     │               │                  │                 │    (LRU Map)   │
     │               │                  │                 │ Cache miss     │
     │               │                  │                 │ 4. SQL queries │
     │               │                  │                 │    (12 parallel)
     │               │                  │                 ├───────────────>│
     │               │                  │                 │ Agrega JSONB   │
     │               │                  │                 │<───────────────┤
     │               │                  │                 │ 5. Salva cache │
     │               │                  │<────────────────┤                │
     │               │ 6. JSON response │                 │                │
     │               │<─────────────────┤                 │                │
     │ 7. Renderiza  │                  │                 │                │
     │    gráficos   │                  │                 │                │
     │<──────────────┤                  │                 │                │
```

---

## Resumo das Conexões

**Módulo → Dependências:**
- AppModule → Todos os módulos
- ConfigModule → (nenhuma)
- PrismaModule → ConfigModule
- AuthModule → PrismaModule, ConfigModule
- SitesModule → PrismaModule
- SdkModule → PrismaModule, SitesModule
- EventsModule → PrismaModule
- InsightsModule → PrismaModule, ConfigModule
- HealthModule → PrismaModule

**Guards → Usado em:**
- AuthGuard → AuthController, SitesController
- TenantGuard → EventsController, InsightsController, SdkController

**Services → Dependências:**
- AuthService → PrismaService, ConfigService, auth.utils
- SitesService → PrismaService, site-key.utils
- EventsService → PrismaService
- InsightsService → PrismaService
- SdkService → PrismaService
- HealthService → PrismaService

Este documento serve como referência completa para entender como cada parte do sistema funciona e se conecta com as outras.

