# InsightHouse Backend - NestJS API

Analytics and event tracking backend built with NestJS, TypeScript, Prisma, and PostgreSQL.

## Features

- 🔐 **Authentication**: Session-based auth with secure password hashing
- 🏢 **Multi-Tenancy**: Site-based tenancy with domain validation
- 📊 **Event Tracking**: High-performance event ingestion with batch support
- 🎯 **Analytics**: Real-time insights and user behavior analysis
- 🔒 **Security**: CORS, Helmet, rate limiting, IP anonymization
- 📝 **Validation**: Automatic request validation with class-validator
- 🚀 **Performance**: Optimized database queries and caching ready

## Tech Stack

- **Framework**: NestJS 11+
- **Language**: TypeScript 5+
- **Database**: PostgreSQL with Prisma ORM
- **Validation**: class-validator + class-transformer
- **Security**: Helmet, CORS, Throttler
- **Package Manager**: pnpm

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 9+
- PostgreSQL 15+

### Installation

1. **Start PostgreSQL** (na raiz do projeto):
   ```bash
   # Voltar para a raiz
   cd ..

   # Iniciar Docker Compose
   docker-compose up -d

   # Verificar se está rodando
   docker-compose ps
   ```

2. **Install dependencies** (voltar para /back):
   ```bash
   cd back
   pnpm install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env
   ```

   O `.env.example` já está configurado para o Docker:
   ```env
   DATABASE_URL="postgresql://ih:ih@localhost:5432/insighthouse?schema=public"
   DIRECT_URL="postgresql://ih:ih@localhost:5432/insighthouse?schema=public"
   PORT=3001
   NODE_ENV=development
   FRONTEND_URL="http://localhost:3000"
   NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
   API_BASE_URL="http://localhost:3001"
   ```

   **Importante:** Gerar um secret seguro:
   ```bash
   # Windows (PowerShell)
   [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))

   # Linux/Mac
   openssl rand -base64 32
   ```

4. **Run database migrations**:
   ```bash
   pnpm prisma migrate dev
   pnpm prisma generate
   ```

5. **Start development server**:
   ```bash
   pnpm run start:dev
   ```

The API will be available at `http://localhost:3001/api`

**pgAdmin** is available at `http://localhost:5050`
- Email: `admin@insighthouse.local`
- Password: `admin`

See [DATABASE_SETUP.md](./DATABASE_SETUP.md) for detailed database configuration.

## Project Structure

```
back/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── migrations/            # Database migrations
├── src/
│   ├── auth/                  # Authentication module
│   ├── sites/                 # Sites management module
│   ├── sdk/                   # SDK loader module
│   ├── events/                # Event tracking module
│   ├── insights/              # Analytics module
│   ├── health/                # Health check module
│   ├── prisma/                # Prisma service
│   ├── config/                # Configuration module
│   ├── common/                # Shared utilities
│   │   ├── guards/            # Auth & Tenant guards
│   │   ├── decorators/        # Custom decorators
│   │   └── utils/             # Utility functions
│   ├── app.module.ts          # Root module
│   └── main.ts                # Application entry point
└── .cursor/
    └── rules/                 # Cursor AI rules
```

## Available Scripts

- `pnpm run start` - Start production server
- `pnpm run start:dev` - Start development server with watch mode
- `pnpm run start:debug` - Start with debugging
- `pnpm run build` - Build for production
- `pnpm run lint` - Run ESLint
- `pnpm run format` - Format code with Prettier
- `pnpm run test` - Run unit tests
- `pnpm run test:e2e` - Run end-to-end tests
- `pnpm run test:cov` - Run tests with coverage

## API Documentation

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user (protected)

### Sites Management

- `GET /api/sites` - List all sites (protected)
- `POST /api/sites` - Create new site (protected)
- `GET /api/sites/:id` - Get site details (protected)
- `PUT /api/sites/:id` - Update site (protected)
- `DELETE /api/sites/:id` - Delete site (protected)
- `GET /api/sites/:id/domains` - List site domains (protected)
- `POST /api/sites/:id/domains` - Add domain (protected)
- `DELETE /api/sites/:id/domains/:domainId` - Remove domain (protected)

### SDK

- `GET /api/sdk/loader?site=<siteKey>` - Get SDK loader script
- `GET /api/sdk/site-config?site=<siteKey>` - Get site configuration

### Event Tracking

- `POST /api/events/track` - Track single event (requires X-Site-Key)
- `POST /api/events/track/batch` - Track batch of events (requires X-Site-Key)

### Health

- `GET /api/health` - Basic health check
- `GET /api/health/db` - Database health check

## Security

### Authentication
- Passwords hashed with scrypt (N=16384, r=8, p=1)
- Session cookies signed with HMAC-SHA256
- HttpOnly, Secure (production), SameSite=Lax cookies

### Privacy
- IP addresses anonymized (last octet removed)
- GDPR/LGPD compliant event storage
- No PII stored without consent

### Rate Limiting
- Global: 100 requests per minute
- Event tracking: 1000 requests per minute per site
- Batch tracking: 100 requests per minute per site

### Headers
- Helmet for security headers
- CORS restricted to frontend URL
- Compression enabled

## Database

### Models

- **User**: User accounts with authentication
- **Site**: Website tracking configuration
- **Domain**: Allowed domains per site
- **Setting**: Site-specific settings
- **Event**: Analytics events (high-volume)

### Indexes

Optimized indexes for:
- Event queries by site and time range
- Event queries by type
- Session-based queries
- User-based queries

## Development

### Code Style

- Follow NestJS best practices
- TypeScript strict mode enabled
- ESLint + Prettier for code formatting
- Kebab-case for file names
- PascalCase for classes
- camelCase for functions and variables

### Testing

Run tests:
```bash
pnpm run test
```

Run tests with coverage:
```bash
pnpm run test:cov
```

Run e2e tests:
```bash
pnpm run test:e2e
```

### Database Migrations

Create a new migration:
```bash
pnpm prisma migrate dev --name migration_name
```

Apply migrations:
```bash
pnpm prisma migrate deploy
```

Reset database (development only):
```bash
pnpm prisma migrate reset
```

## Deployment

1. Build the application:
   ```bash
   pnpm run build
   ```

2. Run migrations:
   ```bash
   pnpm prisma migrate deploy
   ```

3. Start production server:
   ```bash
   pnpm run start:prod
   ```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `DIRECT_URL` | Direct database connection (for migrations) | Yes |
| `PORT` | Server port | No (default: 3001) |
| `NODE_ENV` | Environment (development/production) | No |
| `FRONTEND_URL` | Frontend URL for CORS | Yes |
| `NEXTAUTH_SECRET` | Secret for session signing | Yes |
| `API_BASE_URL` | API base URL | Yes |

## Troubleshooting

### Database Connection Issues

Check that PostgreSQL is running and the `DATABASE_URL` is correct:
```bash
pnpm prisma db push
```

### Port Already in Use

Change the `PORT` in `.env` or kill the process using port 3001:
```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3001 | xargs kill -9
```

### Prisma Client Not Generated

Regenerate Prisma client:
```bash
pnpm prisma generate
```

## Contributing

1. Follow the code style guidelines
2. Write tests for new features
3. Update documentation
4. Create descriptive commit messages

## License

UNLICENSED - Private project
