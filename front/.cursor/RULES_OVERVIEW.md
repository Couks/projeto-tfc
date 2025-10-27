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
- Stack tecnológica (Next.js 15, NestJS backend, TypeScript, React Query)
- Estrutura do projeto (frontend/backend separados)
- Princípios Clean Code (SOLID, DRY, KISS, YAGNI)
- Convenções de nomenclatura (arquivos, código, database)
- Path aliases (`@/lib/*`, `@ui/*`)
- Performance e segurança
- Ordem de imports
- Tratamento de erros
- Padrões de data fetching com React Query

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
- Integração com React Query

---

### 3. **react-query.mdc** (Auto-Aplicada) ⭐ **NOVO**

**Descrição**: Padrões para React Query (@tanstack/react-query)

**Aplica-se a**: `src/lib/hooks/**/*.ts`, `src/**/*Client.tsx`

**Conteúdo**:
- Query hooks patterns (useQuery com tipagem adequada)
- Mutation hooks patterns (useMutation com updates otimistas)
- Organização de query keys (centralizada em `queryKeys.ts`)
- Estratégias de invalidação de cache
- Configuração de stale time e garbage collection
- Tratamento de erros em queries/mutations
- Estados de loading e error
- Padrões de prefetching (server-side com getQueryClient)
- Updates otimistas
- Cancelamento de queries
- Queries dependentes (enabled prop)
- Infinite queries (quando necessário)
- Uso do React Query DevTools

---

### 4. **api-client.mdc** (Auto-Aplicada) ⭐ **NOVO**

**Descrição**: Padrões para cliente API centralizado

**Aplica-se a**: `src/lib/api.ts`, `src/lib/hooks/**/*.ts`

**Conteúdo**:
- Uso do singleton ApiClient (`apiClient` de `lib/api.ts`)
- Métodos HTTP (get, post, put, delete)
- Type safety com generics (`apiClient.get<Type>()`)
- Padrões de tratamento de erros
- Inclusão de credentials (`credentials: 'include'`)
- Configuração de base URL (env var)
- Interceptors de request/response (quando necessário)
- Padrões de retry logic
- Tratamento de timeout

---

### 5. **frontend-types.mdc** (Auto-Aplicada) ⭐ **NOVO**

**Descrição**: Organização de tipos TypeScript

**Aplica-se a**: `src/lib/types/**/*.ts`

**Conteúdo**:
- **Tipos Centralizados**: Todos os tipos em `lib/types/`
- **Organização por Domínio**:
  - `insights.ts` - Tipos de analytics que correspondem aos DTOs do backend
  - `sites.ts` - Tipos de sites/domínios
  - `index.ts` - Re-exports para conveniência
- **Nomenclatura de Tipos**: PascalCase para interfaces/types
- **Alinhamento com Backend**: Tipos devem corresponder exatamente às estruturas de resposta do backend
- **Sem tipos `any`**: Aplicação rigorosa de tipagem
- **Inferência de Tipos**: Uso de generics em hooks/chamadas de API
- **Padrões de Export**: Named exports, re-export do index
- **Documentação**: JSDoc para tipos complexos

---

### 6. **authentication-security.mdc** (Auto-Aplicada)

**Descrição**: Autenticação e segurança

**Aplica-se a**: `src/lib/hooks/useAuth.ts`, `src/middleware.ts`, `src/app/(auth)/**/*.tsx`

**Conteúdo**:
- Session management (cookies assinados, HMAC)
- Middleware de autenticação
- Proteção de rotas (public/protected paths)
- Autenticação em componentes
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

### 7. **typescript-utilities.mdc** (Auto-Aplicada)

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
- **Tipos React Query**: Padrões de tipagem para hooks e mutations

---

### 8. **testing.mdc** (Auto-Aplicada)

**Descrição**: Padrões de testes

**Aplica-se a**: `**/*.test.ts`, `**/*.test.tsx`, `**/*.spec.ts`, `**/*.spec.tsx`

**Conteúdo**:
- Filosofia de testes (test pyramid)
- O que testar (e o que não testar)
- Estrutura de testes (naming, describe/it blocks)
- Unit tests (utilities, validation)
- Component tests (React Testing Library)
- **React Query testing patterns** (QueryClientProvider wrapper)
- **Hook testing** com React Query
- **API client mocking** (Mock Service Worker patterns)
- Testing hooks
- Mocking (modules, API client, fetch)
- Test helpers (custom render, fixtures)
- Best practices (AAA pattern, one assertion per test, edge cases)
- Code coverage (goals, running coverage)

---

### 9. **documentation.mdc** (Auto-Aplicada)

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

### 10. **template-component.mdc** (Manual/Template)

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

### 11. **template-api-route.mdc** (Manual/Template) ❌ **REMOVIDO**

**Descrição**: ~~Templates para criação de rotas de API~~

**Status**: **REMOVIDO** - Não temos mais API routes no frontend (todas no backend NestJS)

---

### 12. **database-prisma.mdc** (Auto-Aplicada) ❌ **REMOVIDO**

**Descrição**: ~~Padrões de database e Prisma ORM~~

**Status**: **REMOVIDO** - Prisma é usado apenas no backend, não no frontend

---

## 📚 Documentação Complementar

### **MIGRATION_NOTES.md** ⭐ **NOVO**
Guia de migração da arquitetura com:
- Evolução da arquitetura (monolito → frontend/backend separados)
- Breaking changes dos padrões antigos
- Como migrar componentes
- Como migrar data fetching
- Armadilhas comuns
- Exemplos antes/depois

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
- `NEXT_PUBLIC_API_BASE_URL` - Backend API URL
- `NEXTAUTH_SECRET` - Session signing secret
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
2. Trabalha com React Query hooks → `react-query.mdc`
3. Usa o API client → `api-client.mdc`
4. Define tipos TypeScript → `frontend-types.mdc`
5. Modifica arquivos de auth → `authentication-security.mdc`
6. Escreve utilities → `typescript-utilities.mdc`
7. Escreve testes → `testing.mdc`
8. Atualiza documentação → `documentation.mdc`

A regra `architecture.mdc` está **sempre ativa**.

### Uso Manual de Templates

Para usar templates, mencione-os explicitamente:

```
@template-component Create a new UserProfile component with edit functionality
```

### Verificando Regras Ativas

No Cursor, veja a sidebar para visualizar quais regras estão ativas no contexto atual.

---

## 📊 Estrutura de Aplicação

### Por Tipo de Aplicação

| Quando você está... | Regras aplicadas |
|---------------------|------------------|
| Criando componente | `architecture` + `react-components` |
| Criando React Query hook | `architecture` + `react-query` |
| Usando API client | `architecture` + `api-client` |
| Definindo tipos | `architecture` + `frontend-types` |
| Implementando auth | `architecture` + `authentication-security` |
| Escrevendo utility | `architecture` + `typescript-utilities` |
| Escrevendo teste | `architecture` + `testing` |
| Atualizando docs | `architecture` + `documentation` |

### Por Contexto de Trabalho

**Novo Feature Completo**:
1. Tipos (`frontend-types`)
2. API client usage (`api-client`)
3. React Query hooks (`react-query`)
4. Componentes (`react-components`)
5. Testes (`testing`)
6. Documentação (`documentation`)

Todas com `architecture` como base.

---

## 🎓 Próximos Passos

1. **Familiarize-se** com as regras lendo os arquivos em `.cursor/rules/`
2. **Pratique** criando novos componentes e hooks usando os templates
3. **Consulte** `MIGRATION_NOTES.md` para entender as mudanças
4. **Contribua** seguindo `CONTRIBUTING.md`
5. **Mantenha** as regras atualizadas conforme o projeto evolui

---

## 📞 Suporte

- Dúvidas sobre regras: Consulte `.cursor/rules/README.md`
- Dúvidas sobre migração: Consulte `MIGRATION_NOTES.md`
- Dúvidas sobre contribuição: Consulte `CONTRIBUTING.md`
- Issues: Abra uma issue no repositório

---

**Última atualização**: Janeiro 2025
**Versão das Regras**: 2.0.0
**Arquitetura**: Frontend/Backend Separados
