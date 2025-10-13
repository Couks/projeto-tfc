# Insighthouse (Realty Analytics SaaS)

A multi-tenant analytics SaaS for real estate websites powered by PostHog. It provides customer onboarding, site configuration, a first‑party loader served from this app, and a simple dashboards UI.

## Project Structure

- `src/app/` — Next.js App Router app (API routes under `src/app/api/*`)
- `src/lib/` — shared server utilities (Prisma client, site helpers)
- `public/static/` — first‑party static assets served by the app
  - `posthog.iife.js` — PostHog browser SDK IIFE bundle (latest)
  - `capture-filtros.js` — generic capture script for search filters & conversions

## Environment Variables

Create a `.env` file in `insighthouse/` (same folder as this README). You can start from `.env.example` and adjust:

- `SITE_URL` — Base URL of the app (e.g., `http://localhost:3000`)
- `DATABASE_URL` — PostgreSQL connection string
- `POSTHOG_API_HOST` — PostHog API host (`https://app.posthog.com` or self-hosted)
- `POSTHOG_PROJECT_API_KEY` — Project API Key (used client-side by `posthog-js` via loader)
- `POSTHOG_PERSONAL_API_KEY` — Personal API Key (server-side for Query/Insights)
- `POSTHOG_PROJECT_ID` — Project ID for server-side endpoints (e.g., `12345`)
- `NEXTAUTH_SECRET` — Placeholder for future Auth usage

## Local Development

1) Install dependencies at the monorepo root:
```
pnpm i
```

2) Start PostgreSQL (example using Docker on port 5433 to avoid conflicts):
```
docker run --name realty_analytics_postgres_dev \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=realty_analytics \
  -p 5433:5432 -d postgres:15-alpine
```

3) Create `insighthouse/.env` from `.env.example` and ensure `DATABASE_URL` points to port 5433.

4) Apply Prisma migrations and generate client:
```
cd insighthouse
pnpm prisma:migrate -- --name init
```

5) Build PostHog IIFE bundle (from repo root):
```
pnpm -w build:posthog
```

6) Run the dev server:
```
pnpm dev
```

- Local: `http://localhost:3000`

## Loader & Site Config

- Loader endpoint: `GET /api/sdk/loader?site=SITE_KEY`
  - Validates the current `location.hostname` against allowed domains from site config
  - Loads `posthog.iife.js` from `public/static`
  - Calls `posthog.init` with autocapture and page events
  - Groups or registers `site` via `SITE_KEY`
  - Injects `capture-filtros.js`

- Site config endpoint: `GET /api/sdk/site-config?site=SITE_KEY`
  - Returns `{ phKey, apiHost, allowedDomains, groupEnabled, options, consentDefault }`

### Installation Snippet (Client Website)

Place before closing `</head>`:
```
<script async src="https://YOUR-APP-DOMAIN/api/sdk/loader?site=SITE_KEY"></script>
```

For local testing:
```
<script async src="http://localhost:3000/api/sdk/loader?site=SITE_KEY"></script>
```

To enable debug logs in the client console:
```
window.MyAnalytics = window.MyAnalytics || {};
window.MyAnalytics.debug = true;
```

## Captured Events (Manual)

- `search_filter_changed` — `{ field, value }`
- `search_filter_city` — `{ cidade }`
- `search_filter_type` — `{ tipo }`
- `search_filter_bairro` — `{ bairro }`
- `search_submit` — `{ source, finalidade, preco_min, preco_max, area_min, area_max }`
- `results_item_click` — `{ target, kind: 'imovel' | 'condominio' }`
- `conversion_whatsapp_click` / `conversion_phone_click` / `conversion_email_click` / `conversion_lead_submit`

## API (SaaS)

- `POST /api/sites` — create site, generate `siteKey`, returns `loaderUrl`
- `POST /api/sites/:id/domains` — add domain/alias
- `GET  /api/insights/top-cidades?site=SITE_KEY` — proxy to PostHog Query/HogQL

## Consent & LGPD

- Per‑site setting `consent_default` (`opt_in` or `opt_out`)
- Loader respects default and allows runtime control via `window.__MYANALYTICS_CONSENT__`
- Use `posthog.opt_in_capturing()` / `posthog.opt_out_capturing()` as needed

## Architecture

- Next.js 15 (App Router) hosts admin UI and public loader endpoints
- Prisma + PostgreSQL for multi‑tenant metadata (Users, Sites, Domains, Settings)
- PostHog for event ingestion and analytics queries
- First‑party loader serves `posthog.iife.js` and `capture-filtros.js` under `public/static`

## Notes

- Ensure CSP includes this origin and your `POSTHOG_API_HOST`
- Static files under `public/static` can be cached and versioned
- No PII captured; only structural search/filter and conversion signals
