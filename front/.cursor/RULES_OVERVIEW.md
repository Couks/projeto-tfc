# Cursor Rules - Visão Geral Completa

Este documento fornece uma visão geral de todas as regras de padronização criadas para o projeto InsightHouse.

## 📋 Índice

- [Regras Criadas](#regras-criadas)
- [Documentação Complementar](#documentação-complementar)
- [Como Usar](#como-usar)
- [Estrutura de Aplicação](#estrutura-de-aplicação)

## 🎯 Regras Criadas

### 1. **architecture.mdc** ⭐ (Sempre Aplicada)

**Descrição**: Padrões gerais de arquitetura e código

**Conteúdo**:
- Stack tecnológica (Next.js 15, TypeScript, Prisma, PostgreSQL)
- Estrutura do projeto
- Princípios Clean Code (SOLID, DRY, KISS, YAGNI)
- Convenções de nomenclatura (arquivos, código, database)
- Path aliases (`@/lib/*`, `@ui/*`)
- Performance e segurança
- Ordem de imports
- Tratamento de erros

**Aplicação**: Sempre incluída em todos os contextos

---

### 2. **react-components.mdc** (Auto-Aplicada)

**Descrição**: Padrões para componentes React

**Aplica-se a**: `src/**/*.tsx`, `src/**/*.jsx`

**Conteúdo**:
- Server vs Client Components
- Anatomia de componentes
- Estrutura de props
- Gerenciamento de estado
- Event handlers
- Styling com Tailwind
- Renderização condicional
- Lists e keys
- Composição de componentes
- Performance (React.memo, useCallback)
- Acessibilidade

---

### 3. **api-routes.mdc** (Auto-Aplicada)

**Descrição**: Padrões para rotas de API

**Aplica-se a**: `src/app/api/**/*.ts`

**Conteúdo**:
- Organização de rotas
- Estrutura de handlers (GET, POST, PUT, DELETE)
- Validação com Zod (body, query params, route params)
- Autenticação e autorização
- HTTP status codes apropriados
- Formato de resposta consistente
- Tratamento de erros
- Operações de database
- Transações
- Performance e caching
- Rate limiting e CORS
- Logging estruturado

---

### 4. **database-prisma.mdc** (Auto-Aplicada)

**Descrição**: Padrões de database e Prisma ORM

**Aplica-se a**: `prisma/**/*.prisma`, `src/lib/db.ts`

**Conteúdo**:
- Design de schema (naming, IDs, timestamps)
- Relacionamentos (one-to-many, one-to-one, many-to-many)
- Cascade deletion
- Indexes (single, composite, unique)
- Inicialização do Prisma Client (singleton pattern)
- Operações CRUD
- Queries avançadas (filtering, sorting, pagination)
- Aggregações e group by
- Transações
- Raw SQL (quando necessário)
- Migrações
- Performance optimization
- Error handling (códigos de erro Prisma)
- Segurança (row-level security, dados sensíveis)

---

### 5. **authentication-security.mdc** (Auto-Aplicada)

**Descrição**: Autenticação e segurança

**Aplica-se a**: `src/lib/auth.ts`, `src/middleware.ts`, `src/app/api/auth/**/*.ts`

**Conteúdo**:
- Session management (cookies assinados, HMAC)
- Password security (scrypt hashing)
- Middleware de autenticação
- Proteção de rotas (public/protected paths)
- Autenticação em API routes
- Autorização (ownership check)
- Validação e sanitização de inputs
- Security headers (CSP, CORS, X-Frame-Options)
- CORS configuration
- Rate limiting
- CSRF protection
- Constant-time comparison
- Environment variables seguros
- Logging de eventos de segurança
- Pitfalls comuns a evitar

---

### 6. **typescript-utilities.mdc** (Auto-Aplicada)

**Descrição**: TypeScript e funções utilitárias

**Aplica-se a**: `src/utils/**/*.ts`, `src/lib/**/*.ts`

**Conteúdo**:
- Configuração TypeScript (strict mode)
- Type safety (evitar `any`)
- Interface vs Type
- Generic types
- Utility types (Partial, Pick, Omit, Record, etc.)
- Type guards
- Pure functions
- Function signatures
- Error handling em utilities
- Padrões comuns:
  - String utilities (truncate, slugify, capitalize)
  - Array utilities (unique, groupBy, chunk, shuffle)
  - Object utilities (pick, omit, deepClone)
  - Date utilities (formatDate, timeAgo, addDays)
  - Async utilities (sleep, retry, timeout, debounce, throttle)
  - Validation utilities (email, URL, UUID, CUID)
  - Class utilities (cn para Tailwind)
- Type-safe constants
- Enums vs const objects
- JSDoc documentation
- Testing considerations

---

### 7. **testing.mdc** (Auto-Aplicada)

**Descrição**: Padrões de testes

**Aplica-se a**: `**/*.test.ts`, `**/*.test.tsx`, `**/*.spec.ts`, `**/*.spec.tsx`

**Conteúdo**:
- Filosofia de testes (test pyramid)
- O que testar (e o que não testar)
- Estrutura de testes (naming, describe/it blocks)
- Unit tests (utilities, validation)
- Component tests (React Testing Library)
- Testing hooks
- API route tests
- Mocking (modules, Prisma, fetch)
- Test helpers (custom render, fixtures)
- Best practices (AAA pattern, one assertion per test, edge cases)
- Code coverage (goals, running coverage)

---

### 8. **documentation.mdc** (Auto-Aplicada)

**Descrição**: Padrões de documentação

**Aplica-se a**: `README.md`, `CONTRIBUTING.md`, `docs/**/*.md`

**Conteúdo**:
- Estrutura de README
- Code documentation (file headers, JSDoc)
- Complex logic comments
- TODOs e FIXMEs
- API documentation (endpoints, request/response)
- Component documentation (README pattern)
- Database schema comments
- Changelog (Keep a Changelog format)
- Architecture Decision Records (ADR)
- Inline documentation best practices
- Documentation maintenance

---

### 9. **template-component.mdc** (Manual/Template)

**Descrição**: Templates para criação de componentes React

**Como usar**: `@template-component Create a new component...`

**Conteúdo**:
- Server Component template
- Client Component template
- Feature component com sub-components
- Form component template
- List component template
- Modal/Dialog component template
- Checklist para novos componentes

---

### 10. **template-api-route.mdc** (Manual/Template)

**Descrição**: Templates para criação de rotas de API

**Como usar**: `@template-api-route Create a new API endpoint...`

**Conteúdo**:
- Collection route (GET, POST)
- Item route (GET, PUT, DELETE)
- Public API route
- File upload route
- Webhook route
- Batch operation route
- Checklist para novos endpoints

---

## 📚 Documentação Complementar

### **AGENTS.md**
Instruções principais para o Cursor AI com:
- Visão geral do projeto
- Arquitetura e decisões de design
- Guias de trabalho (adicionar features, padrões comuns)
- Considerações de segurança
- Otimização de performance
- Estratégia de testes
- Variáveis de ambiente
- Workflow de desenvolvimento
- Troubleshooting

### **CONTRIBUTING.md**
Guia de contribuição com:
- Code of Conduct
- Setup inicial
- Workflow de desenvolvimento
- Code standards
- Commit guidelines (Conventional Commits)
- Pull request process
- Testing guidelines
- Estrutura do projeto
- Reconhecimento de contribuidores

### **.cursor/rules/README.md**
Documentação das regras com:
- Explicação de como funcionam as regras
- Lista de regras disponíveis
- Como usar regras (automático vs manual)
- Tipos de regras (Always, Auto Attached, Manual)
- Como criar novas regras
- Best practices
- Troubleshooting
- Exemplos práticos

### **.env.example**
Template de variáveis de ambiente:
- `DATABASE_URL` - PostgreSQL connection
- `DIRECT_URL` - Direct database connection
- `NEXTAUTH_SECRET` - Session signing secret
- `SITE_URL` - Application base URL
- `NODE_ENV` - Environment

### **README.md** (Atualizado)
README principal atualizado com:
- Seção sobre desenvolvimento e padrões
- Referências às regras do Cursor
- Convenções de nomenclatura
- Estrutura de código
- Validação e type safety
- Segurança
- Como contribuir

---

## 🚀 Como Usar

### Aplicação Automática

As regras são aplicadas automaticamente quando você:
1. Edita um componente React → `react-components.mdc`
2. Cria/edita uma API route → `api-routes.mdc`
3. Trabalha com schema Prisma → `database-prisma.mdc`
4. Modifica arquivos de auth → `authentication-security.mdc`
5. Escreve utilities → `typescript-utilities.mdc`
6. Escreve testes → `testing.mdc`
7. Atualiza documentação → `documentation.mdc`

A regra `architecture.mdc` está **sempre ativa**.

### Uso Manual de Templates

Para usar templates, mencione-os explicitamente:

```
@template-component Create a new UserProfile component with edit functionality
```

```
@template-api-route Create an API endpoint to manage user settings
```

### Verificando Regras Ativas

No Cursor, veja a sidebar para visualizar quais regras estão ativas no contexto atual.

---

## 📊 Estrutura de Aplicação

### Por Tipo de Aplicação

| Quando você está... | Regras aplicadas |
|---------------------|------------------|
| Criando componente | `architecture` + `react-components` |
| Criando API route | `architecture` + `api-routes` |
| Modificando schema | `architecture` + `database-prisma` |
| Implementando auth | `architecture` + `authentication-security` |
| Escrevendo utility | `architecture` + `typescript-utilities` |
| Escrevendo teste | `architecture` + `testing` |
| Atualizando docs | `architecture` + `documentation` |

### Por Contexto de Trabalho

**Novo Feature Completo**:
1. Schema (database-prisma)
2. API routes (api-routes)
3. Componentes (react-components)
4. Testes (testing)
5. Documentação (documentation)

Todas com `architecture` como base.

---

## 🎓 Próximos Passos

1. **Familiarize-se** com as regras lendo os arquivos em `.cursor/rules/`
2. **Pratique** criando novos componentes e APIs usando os templates
3. **Consulte** `AGENTS.md` para entender a arquitetura
4. **Contribua** seguindo `CONTRIBUTING.md`
5. **Mantenha** as regras atualizadas conforme o projeto evolui

---

## 📞 Suporte

- Dúvidas sobre regras: Consulte `.cursor/rules/README.md`
- Dúvidas sobre arquitetura: Consulte `AGENTS.md`
- Dúvidas sobre contribuição: Consulte `CONTRIBUTING.md`
- Issues: Abra uma issue no repositório

---

**Última atualização**: Outubro 2025
**Versão das Regras**: 1.0.0

