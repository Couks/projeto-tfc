# Database Setup Guide

## Using Docker Compose (Recommended)

O projeto já inclui um `docker-compose.yml` configurado na raiz com PostgreSQL 16 e pgAdmin.

### Configuração do Docker Compose

```yaml
# Credentials configuradas:
- User: ih
- Password: ih
- Database: insighthouse
- Port: 5432
- pgAdmin Port: 5050
```

### 1. Iniciar o Banco de Dados

Na **raiz do projeto** (não em `/back`):

```bash
# Iniciar o PostgreSQL e pgAdmin
docker-compose up -d

# Verificar se está rodando
docker-compose ps

# Ver logs (se necessário)
docker-compose logs db
```

### 2. Configurar o Backend

Vá para a pasta `/back` e configure o ambiente:

```bash
cd back

# Copiar o arquivo de exemplo
cp .env.example .env
```

O `.env.example` já está configurado para conectar ao Docker:

```env
DATABASE_URL="postgresql://ih:ih@localhost:5432/insighthouse?schema=public"
DIRECT_URL="postgresql://ih:ih@localhost:5432/insighthouse?schema=public"
```

### 3. Executar Migrações

```bash
# Instalar dependências (se ainda não fez)
pnpm install

# Executar migrações do Prisma
pnpm prisma migrate dev

# Gerar o Prisma Client
pnpm prisma generate
```

### 4. Verificar a Conexão

```bash
# Abrir Prisma Studio para ver o banco
pnpm prisma studio
```

Ou acesse o pgAdmin:
- URL: http://localhost:5050
- Email: admin@insighthouse.local
- Password: admin

### 5. Parar o Banco de Dados

```bash
# Parar os containers (mantém os dados)
docker-compose stop

# Parar e remover containers (mantém os dados no volume)
docker-compose down

# Parar e REMOVER TODOS OS DADOS (cuidado!)
docker-compose down -v
```

## Conectando o pgAdmin ao PostgreSQL

1. Acesse http://localhost:5050
2. Login com:
   - Email: `admin@insighthouse.local`
   - Password: `admin`

3. Adicionar novo servidor:
   - **General Tab:**
     - Name: `InsightHouse Local`

   - **Connection Tab:**
     - Host: `db` (nome do serviço no docker-compose)
     - Port: `5432`
     - Maintenance database: `insighthouse`
     - Username: `ih`
     - Password: `ih`
     - Save password: ✅

4. Clique em "Save"

## Comandos Úteis do Docker

```bash
# Ver containers rodando
docker ps

# Ver logs do PostgreSQL
docker logs ih-postgres

# Ver logs do pgAdmin
docker logs ih-pgadmin

# Acessar o terminal do PostgreSQL
docker exec -it ih-postgres psql -U ih -d insighthouse

# Backup do banco
docker exec ih-postgres pg_dump -U ih insighthouse > backup.sql

# Restaurar backup
docker exec -i ih-postgres psql -U ih insighthouse < backup.sql
```

## Comandos Úteis do Prisma

```bash
# Ver status das migrações
pnpm prisma migrate status

# Criar nova migração
pnpm prisma migrate dev --name migration_name

# Aplicar migrações em produção
pnpm prisma migrate deploy

# Resetar banco (CUIDADO: apaga tudo!)
pnpm prisma migrate reset

# Abrir Prisma Studio (GUI do banco)
pnpm prisma studio

# Gerar Prisma Client
pnpm prisma generate

# Validar schema
pnpm prisma validate

# Formatar schema
pnpm prisma format
```

## Queries SQL Diretas

Se precisar executar queries SQL diretas:

```bash
# Conectar ao banco via docker
docker exec -it ih-postgres psql -U ih -d insighthouse

# Ou via psql local (se instalado)
psql -h localhost -U ih -d insighthouse
```

Comandos úteis no psql:
```sql
-- Listar tabelas
\dt

-- Ver estrutura de uma tabela
\d "User"
\d "Event"

-- Ver índices
\di

-- Contar eventos
SELECT COUNT(*) FROM "Event";

-- Ver últimos eventos
SELECT * FROM "Event" ORDER BY "createdAt" DESC LIMIT 10;

-- Sair
\q
```

## Troubleshooting

### Erro: "Porta 5432 já está em uso"

Se você já tem PostgreSQL rodando localmente:

**Opção 1:** Parar o PostgreSQL local
```bash
# Windows
net stop postgresql-x64-XX

# Linux/Mac
sudo systemctl stop postgresql
```

**Opção 2:** Mudar a porta no docker-compose.yml
```yaml
ports:
  - "5433:5432"  # Usa 5433 localmente
```

E atualizar o `.env`:
```env
DATABASE_URL="postgresql://ih:ih@localhost:5433/insighthouse?schema=public"
```

### Erro: "Database does not exist"

```bash
# Criar o banco manualmente
docker exec -it ih-postgres createdb -U ih insighthouse

# Ou via psql
docker exec -it ih-postgres psql -U ih -c "CREATE DATABASE insighthouse;"
```

### Erro: "Connection refused"

1. Verificar se o container está rodando:
   ```bash
   docker ps | grep postgres
   ```

2. Ver logs do container:
   ```bash
   docker logs ih-postgres
   ```

3. Verificar health check:
   ```bash
   docker inspect ih-postgres | grep -A 10 Health
   ```

### Erro: Prisma não consegue conectar

1. Verificar se o DATABASE_URL está correto no `.env`
2. Verificar se o container está rodando
3. Testar conexão:
   ```bash
   pnpm prisma db push
   ```

### Performance Lenta

O docker-compose já está otimizado com:
- Named volumes (melhor performance)
- Configurações de memória otimizadas
- WAL compression ativado

Se ainda estiver lento:
1. Aumentar memória do Docker Desktop (Windows/Mac)
2. Usar Linux ou WSL2 no Windows

## Variáveis de Ambiente Completas

### Backend (`back/.env`)

```env
# Database (Docker Compose)
DATABASE_URL="postgresql://ih:ih@localhost:5432/insighthouse?schema=public"
DIRECT_URL="postgresql://ih:ih@localhost:5432/insighthouse?schema=public"

# Application
PORT=3001
NODE_ENV=development

# Frontend
FRONTEND_URL="http://localhost:3000"

# Security
NEXTAUTH_SECRET="gerar-com-openssl-rand-base64-32"

# API
API_BASE_URL="http://localhost:3001"
```

### Frontend (`insighthouse/.env.local`)

```env
# API
NEXT_PUBLIC_API_BASE_URL="http://localhost:3001"

# Database (mesmo do backend)
DATABASE_URL="postgresql://ih:ih@localhost:5432/insighthouse?schema=public"
DIRECT_URL="postgresql://ih:ih@localhost:5432/insighthouse?schema=public"

# Security (mesmo secret do backend)
NEXTAUTH_SECRET="mesmo-secret-do-backend"
```

## Fluxo Completo de Setup

1. **Iniciar Docker:**
   ```bash
   # Na raiz do projeto
   docker-compose up -d
   ```

2. **Configurar Backend:**
   ```bash
   cd back
   cp .env.example .env
   # Editar .env se necessário (já está configurado)
   pnpm install
   pnpm prisma migrate dev
   pnpm prisma generate
   ```

3. **Testar Conexão:**
   ```bash
   pnpm prisma studio
   # Ou
   pnpm run start:dev
   curl http://localhost:3001/api/health/db
   ```

4. **Pronto!** O banco está configurado e pronto para uso.

## Dados de Exemplo (Seed)

Se quiser adicionar dados de exemplo, crie `back/prisma/seed.ts`:

```typescript
import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/common/utils/auth.utils';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Criar usuário de teste
  const passwordHash = await hashPassword('password123');
  const user = await prisma.user.create({
    data: {
      email: 'test@insighthouse.com',
      name: 'Test User',
      passwordHash,
    },
  });

  console.log('Created user:', user.email);

  // Criar site de teste
  const site = await prisma.site.create({
    data: {
      userId: user.id,
      name: 'Test Site',
      siteKey: 'sk_test_1234567890',
      domains: {
        create: {
          host: 'localhost',
          isPrimary: true,
        },
      },
    },
  });

  console.log('Created site:', site.name);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

Adicionar no `package.json`:
```json
{
  "prisma": {
    "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
  }
}
```

Executar:
```bash
pnpm prisma db seed
```

