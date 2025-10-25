# 🚀 Deploy Guide - NestJS Backend

Este guia explica como fazer deploy do backend NestJS no Easypanel usando Docker.

## 📋 Pré-requisitos

- Conta no Easypanel
- Repositório GitHub com o código
- Banco PostgreSQL (Railway recomendado)

## 🐳 Dockerfile Otimizado

O Dockerfile utiliza multi-stage build para otimizar o tamanho da imagem:

### Estágios:
1. **deps**: Instala dependências
2. **builder**: Compila o código TypeScript
3. **runner**: Imagem final de produção

### Características:
- ✅ Multi-stage build (imagem menor)
- ✅ Usuário não-root (segurança)
- ✅ Health check automático
- ✅ Cache de dependências otimizado
- ✅ Prisma client gerado automaticamente

## 🔧 Configuração no Easypanel

### 1. Método de Build: Dockerfile

No Easypanel, selecione:
- **Build Method**: Dockerfile
- **Dockerfile Path**: `back/Dockerfile` (ou apenas `Dockerfile` se estiver na raiz)
- **Context**: `back/` (pasta do backend)

### 2. Variáveis de Ambiente

Configure as seguintes variáveis:

```env
# Database
DATABASE_URL=postgresql://user:pass@host:port/db

# Application
NODE_ENV=production
PORT=3001

# Frontend
FRONTEND_URL=https://seu-frontend.vercel.app

# Security
NEXTAUTH_SECRET=sua-chave-super-secreta-aqui
```

### 3. Porta

- **Port**: `3001`
- **Protocol**: HTTP

## 🏗️ Processo de Build

O Dockerfile executa automaticamente:

1. **Instala dependências** com pnpm
2. **Gera Prisma client** (`npx prisma generate`)
3. **Compila TypeScript** (`npm run build`)
4. **Inicia aplicação** (`npm run start:prod`)

## 🔍 Health Check

O container inclui health check automático:

```bash
GET /api/health
```

- **Interval**: 30s
- **Timeout**: 3s
- **Retries**: 3
- **Start Period**: 5s

## 📊 Monitoramento

### Logs
```bash
# Ver logs em tempo real
docker logs -f container_name

# Ver logs do Easypanel
# Acesse o dashboard do Easypanel
```

### Métricas
- CPU usage
- Memory usage
- Network I/O
- Disk I/O

## 🚨 Troubleshooting

### Problemas Comuns

#### 1. Build Falha
```bash
# Verificar se todas as dependências estão no package.json
npm install

# Verificar se o Prisma está configurado
npx prisma generate
```

#### 2. Database Connection
```bash
# Testar conexão com o banco
npx prisma db pull

# Verificar se a DATABASE_URL está correta
echo $DATABASE_URL
```

#### 3. Port Already in Use
```bash
# Verificar se a porta 3001 está livre
netstat -tulpn | grep 3001

# Ou usar porta diferente
PORT=3002
```

### Logs de Debug

Para debug, adicione logs no `main.ts`:

```typescript
console.log('Database URL:', process.env.DATABASE_URL);
console.log('Frontend URL:', process.env.FRONTEND_URL);
console.log('Node ENV:', process.env.NODE_ENV);
```

## 🔄 Deploy Automático

### GitHub Actions (Opcional)

Crie `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Easypanel

on:
  push:
    branches: [main]
    paths: ['back/**']

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Easypanel
        run: |
          # Trigger deploy via Easypanel API
          curl -X POST "https://api.easypanel.com/deploy" \
            -H "Authorization: Bearer ${{ secrets.EASYPANEL_TOKEN }}" \
            -H "Content-Type: application/json" \
            -d '{"service": "backend"}'
```

## 📈 Performance

### Otimizações Aplicadas

1. **Multi-stage build**: Reduz tamanho da imagem
2. **Alpine Linux**: Imagem base menor
3. **Node.js 18**: Versão LTS otimizada
4. **pnpm**: Instalador mais rápido
5. **Cache de dependências**: Rebuild mais rápido

### Tamanho da Imagem

- **Antes**: ~800MB
- **Depois**: ~200MB
- **Redução**: ~75%

## 🔐 Segurança

### Medidas Implementadas

1. **Usuário não-root**: Container roda como `nestjs:nodejs`
2. **Health check**: Monitoramento automático
3. **Environment variables**: Secrets não expostos
4. **Alpine Linux**: Menor superfície de ataque

## 📝 Checklist de Deploy

- [ ] Dockerfile criado e testado localmente
- [ ] Variáveis de ambiente configuradas
- [ ] Banco de dados acessível
- [ ] Health check funcionando
- [ ] Logs sendo gerados corretamente
- [ ] Frontend conectando com backend
- [ ] Autenticação funcionando
- [ ] API endpoints respondendo

## 🆘 Suporte

Se encontrar problemas:

1. **Verificar logs** no dashboard do Easypanel
2. **Testar localmente** com Docker
3. **Verificar variáveis** de ambiente
4. **Contatar suporte** do Easypanel

---

**🎉 Deploy realizado com sucesso!**

Seu backend NestJS está rodando em produção com todas as otimizações aplicadas.
