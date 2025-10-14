# Insighthouse (SaaS de Analytics Imobiliário)

Um SaaS de analytics multi-tenant para sites imobiliários, alimentado pelo PostHog. Oferece onboarding de clientes, configuração de sites, um loader first‑party servido por esta aplicação e uma UI de dashboard para operadores.

## Resumo Executivo

O Insighthouse permite que qualquer site imobiliário utilize um loader de analytics first‑party que captura interações de busca (filtros, cidade, faixas de preço, etc.), envia para o PostHog e expõe insights prontos para operadores em uma UI administrativa. O sistema é multi-tenant: cada cliente possui um "Site" com domínios e configurações. A aplicação roda em Next.js (App Router), persiste metadados em PostgreSQL (Supabase) e consulta analytics via API Privada do PostHog (HogQL).

## Estrutura do Projeto

- `src/app/` — App Next.js com App Router (rotas de API em `src/app/api/*`)
- `src/lib/` — utilitários compartilhados no servidor (cliente Prisma, helpers de site)
- `public/static/` — assets estáticos first‑party servidos pela aplicação
  - `posthog.iife.js` — bundle IIFE do SDK PostHog para browser (versão mais recente)
  - `capture-filtros.js` — script genérico de captura para filtros de busca e conversões

  - `prisma/` — schema e migrations do Prisma
  - `scripts/` — helpers de build (ex.: `build-posthog.mjs` gera o bundle IIFE do PostHog)

## Variáveis de Ambiente

Crie um arquivo `.env` em `insighthouse/` (mesma pasta deste README). Comece a partir de `env.example` e ajuste:

- `SITE_URL` — URL base da aplicação (ex.: `http://localhost:3000`)
- `DATABASE_URL` — String de conexão PostgreSQL. Para Supabase em ambientes serverless (Vercel), use a conexão pooled (PgBouncer, porta 6543) com `?pgbouncer=true&connection_limit=1&sslmode=require`.
- `DIRECT_URL` — String de conexão direta (sem pool) usada pelo Prisma Migrate. Para Supabase, use o host direto (porta 5432) com `?sslmode=require`.
- `POSTHOG_PUBLIC_API_HOST` — Host público/captura de eventos (US: `https://us.i.posthog.com`, EU: `https://eu.i.posthog.com`)
- `POSTHOG_PRIVATE_API_HOST` — Host privado/admin para queries (US: `https://us.posthog.com`, EU: `https://eu.posthog.com`)
- `POSTHOG_PROJECT_API_KEY` — Chave de API do Projeto (usada client-side pelo `posthog-js` via loader)
- `POSTHOG_PERSONAL_API_KEY` — Chave Pessoal de API (server-side para Query/Insights)
- `POSTHOG_PROJECT_ID` — ID do Projeto para endpoints server-side (ex.: `12345`)
- `NEXTAUTH_SECRET` — Placeholder para uso futuro de autenticação

## Desenvolvimento Local

1) Instale as dependências na raiz do monorepo:
```
pnpm i
```

2) Opção A — Usando Supabase (recomendado):
   - Crie um projeto Supabase e vá para as configurações de Database.
   - Copie a string de conexão pooled (PgBouncer, geralmente porta 6543) para `DATABASE_URL` com `?pgbouncer=true&connection_limit=1&sslmode=require`.
   - Copie a string de conexão direta (porta 5432) para `DIRECT_URL` com `?sslmode=require`.
   - Aplique as migrations do Prisma no Supabase (não-interativo):
```
cd insighthouse
pnpm prisma:deploy
```

3) Opção B — PostgreSQL local (Docker):
```
docker run --name realty_analytics_postgres_dev \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=realty_analytics \
  -p 5433:5432 -d postgres:15-alpine
```

Então configure `DATABASE_URL` como `postgresql://postgres:postgres@localhost:5433/realty_analytics` e rode as migrations:
```
cd insighthouse
pnpm prisma:migrate
```

5) Gere o bundle IIFE do PostHog (da raiz do repositório):
```
pnpm -w build:posthog
```

6) Rode o servidor de desenvolvimento:
```
pnpm dev
```

- Local: `http://localhost:3000`

### Expondo o loader em desenvolvimento (HTTPS)

Sites reais geralmente rodam em HTTPS. Para embedar o loader da sua aplicação local, exponha-a com um túnel e use a origem do túnel no snippet:

- Ngrok: `ngrok http 3000` → `<script async src="https://SEU-ID.ngrok-free.app/api/sdk/loader?site=SITE_KEY&debug=1"></script>`
- Alternativamente, faça deploy na Vercel e use a origem de produção no snippet.

Garanta que o site cliente permite sua origem na Content-Security-Policy (CSP):
- `script-src`: inclua a origem da sua aplicação (Vercel/ngrok)
- `connect-src`: inclua `https://us.i.posthog.com` ou `https://eu.i.posthog.com`

## Loader & Configuração do Site

- Endpoint do loader: `GET /api/sdk/loader?site=SITE_KEY`
  - Valida o `location.hostname` atual contra os domínios permitidos da configuração do site
  - Resolve a origem da aplicação a partir do próprio script do loader (funciona cross-domain)
  - Carrega `posthog.iife.js` de `public/static`
  - Chama `posthog.init` com autocapture e eventos de página
  - Sempre registra `{ site: SITE_KEY }`, e agrupa por `site` quando habilitado
  - Injeta `capture-filtros.js`
  - Suporta `?debug=1` para habilitar logs verbosos e `MyAnalytics.debug`

- Endpoint de configuração do site: `GET /api/sdk/site-config?site=SITE_KEY`
  - Retorna `{ phKey, apiHost, allowedDomains, groupEnabled, options, consentDefault }`

### Snippet de Instalação (Site Cliente)

Coloque antes do fechamento do `</head>`:
```
<script async src="https://SEU-DOMINIO-APP/api/sdk/loader?site=SITE_KEY"></script>
```

Para testes locais:
```
<script async src="http://localhost:3000/api/sdk/loader?site=SITE_KEY"></script>
```

Para habilitar logs de debug no console do cliente:
```
window.MyAnalytics = window.MyAnalytics || {};
window.MyAnalytics.debug = true;
```

Ou configure o debug do SDK PostHog:
```
localStorage.setItem('posthog_debug', 'true'); location.reload();
```

## Eventos Capturados (Manuais)

- `search_filter_changed` — `{ field, value }`
- `search_filter_city` — `{ cidade }`
- `search_filter_type` — `{ tipo }`
- `search_filter_bairro` — `{ bairro }`
- `search_submit` — `{ source, finalidade, preco_min, preco_max, area_min, area_max }`
- `results_item_click` — `{ target, kind: 'imovel' | 'condominio' }`
- `conversion_whatsapp_click` / `conversion_phone_click` / `conversion_email_click` / `conversion_lead_submit`

## API (SaaS)

- `POST /api/sites` — cria site, gera `siteKey`, retorna `loaderUrl`
- `POST /api/sites/:id/domains` — adiciona domínio/alias
- `GET  /api/insights/top-cidades?site=SITE_KEY` — proxy para Query/HogQL do PostHog
- `GET  /api/insights/overview?site=SITE_KEY` — múltiplas agregações HogQL (finalidade, tipos, cidades, bairros, faixas de preço/área, quartos, flags)

### Detalhes de Implementação dos Insights

- Host de API Privada: `POSTHOG_PRIVATE_API_HOST` (US: `https://us.posthog.com` / EU: `https://eu.posthog.com`)
- Autenticação: Bearer `POSTHOG_PERSONAL_API_KEY` com escopo de query; caminho `/api/projects/{PROJECT_ID}/query/`
- Formato do payload:
```
{
  "query": { "kind": "HogQLQuery", "query": "SELECT ... FROM events WHERE ..." },
  "name": "<nome amigável>"
}
```
- Filtros típicos: `event = 'search_filter_city'`, `properties.site = '<SITE_KEY>'`, agrupamento por `properties.cidade` (e equivalentes).

## Consentimento & LGPD

- Configuração por site `consent_default` (`opt_in` ou `opt_out`)
- O loader respeita o padrão e permite controle em runtime via `window.__MYANALYTICS_CONSENT__`
- Use `posthog.opt_in_capturing()` / `posthog.opt_out_capturing()` conforme necessário

## Arquitetura

- Next.js 15 (App Router) hospeda a UI administrativa e endpoints públicos do loader
- Prisma + PostgreSQL para metadados multi‑tenant (Users, Sites, Domains, Settings)
- PostHog para ingestão de eventos e queries de analytics
- Loader first‑party serve `posthog.iife.js` e `capture-filtros.js` em `public/static`

### Fluxo de Dados (ponta a ponta)

1. Site embeda o snippet apontando para o loader do Insighthouse.
2. Loader busca `site-config`, valida `allowedDomains`, inicializa PostHog, registra `{ site: SITE_KEY }`, e injeta `capture-filtros.js`.
3. Interações do usuário disparam eventos (ex.: `search_filter_city`, `search_filter_changed`).
4. Eventos são enviados para o host de API pública do PostHog (`POSTHOG_PUBLIC_API_HOST`).
5. Admin visita o Dashboard. Rotas de API chamam a API Privada do PostHog (HogQL) para computar insights para o `SITE_KEY` dado.
6. Resultados são renderizados como cards/tabelas.

### Modelo de Banco de Dados (Prisma)

- `User`: dono da conta (raiz multi-tenant)
- `Site`: um site tenant com `siteKey`, `status`, dono (`userId`)
- `Domain`: domínios permitidos por site (enforcement de whitelist para o loader)
- `Setting`: key/value para opções por site (ex.: `consent_default`)

### Segurança & Isolamento

- Controle do loader via `allowedDomains`: previne hotlinking de origens não autorizadas.
- Cliente usa apenas `POSTHOG_PROJECT_API_KEY` (seguro para frontend). Queries server-side usam `POSTHOG_PERSONAL_API_KEY` (nunca exposta ao browser).
- Conexões pooled para serverless (`DATABASE_URL`), conexão direta apenas para migrations (`DIRECT_URL`).

### Topologia de Deploy

- Vercel (Next.js): UI Admin + Rotas de API + Assets estáticos
- PostgreSQL Supabase: metadados persistentes (Prisma)
- PostHog Cloud (US/EU): ingestão de analytics + querying

Observações:
- Para embedding local em sites HTTPS, use um túnel (ngrok/Cloudflare Tunnel) ou faça deploy na Vercel.
- Garanta que a CSP do site cliente permite a origem do Insighthouse (script-src) e o host de captura do PostHog (connect-src).

## Notas

- Garanta que a CSP inclui esta origem e seu `POSTHOG_API_HOST`
- Arquivos estáticos em `public/static` podem ser cacheados e versionados
- Nenhum dado PII capturado; apenas sinais estruturais de busca/filtro e conversão

## Troubleshooting

- PostHog 400 parse_error: o payload deve ser `{ query: { kind: 'HogQLQuery', query }, name }` para `/api/projects/{PROJECT_ID}/query/`.
- Insights vazios: gere eventos e atualize; `top-cidades` cacheia por ~60s.
- `posthog` ou `window.MyAnalytics` indefinidos no site cliente:
  - Verifique CSP e remova snippets de analytics legados que possam conflitar.
  - Use loader com `&debug=1` para logar estágios `[Loader]`; verifique 200 para `/static/posthog.iife.js` e `/static/capture-filtros.js`.
- Erros de DB: alinhe mapeamento de porta (5432 vs 5433) e reinicie; para Supabase use `sslmode=require`.

## Roteiro de Apresentação (TCC)

1. Problema: instrumentar UX de busca imobiliária e surfar insights.
2. Design: app Next.js multi-tenant, loader first‑party, PostHog, Supabase.
3. Demo: criar Site → embedar loader → interagir → insights no dashboard.
4. Deep dive: resolução de origem do loader, controle de domínio, schema de eventos, HogQL.
5. Operações: deploy (Vercel), variáveis de ambiente, rotação de chaves, allowlists de CSP.
