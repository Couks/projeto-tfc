# 📚 InsightHouse - Índice de Documentação

Guia completo de toda a documentação do projeto InsightHouse.

---

## 🎯 Começar Aqui

**Novo no projeto?** Leia nesta ordem:

1. 📖 **[README.md](README.md)** - Visão geral do projeto e setup inicial
2. 🤖 **[AGENTS.md](AGENTS.md)** - Instruções para o Cursor AI e arquitetura
3. 🤝 **[CONTRIBUTING.md](CONTRIBUTING.md)** - Como contribuir com o projeto

---

## 📐 Regras e Padrões (Cursor AI)

**Localização:** `.cursor/rules/`

### Regras Sempre Aplicadas:
- **[architecture.mdc](.cursor/rules/architecture.mdc)** - Padrões gerais de arquitetura e código

### Regras Auto-Aplicadas por Contexto:
- **[react-components.mdc](.cursor/rules/react-components.mdc)** - Padrões para componentes React
- **[api-routes.mdc](.cursor/rules/api-routes.mdc)** - Padrões para rotas de API
- **[database-prisma.mdc](.cursor/rules/database-prisma.mdc)** - Padrões de database e Prisma
- **[authentication-security.mdc](.cursor/rules/authentication-security.mdc)** - Autenticação e segurança
- **[typescript-utilities.mdc](.cursor/rules/typescript-utilities.mdc)** - TypeScript e utilities
- **[testing.mdc](.cursor/rules/testing.mdc)** - Padrões de testes
- **[documentation.mdc](.cursor/rules/documentation.mdc)** - Padrões de documentação

### Templates Manuais:
- **[template-component.mdc](.cursor/rules/template-component.mdc)** - Templates de componentes
- **[template-api-route.mdc](.cursor/rules/template-api-route.mdc)** - Templates de APIs

### Documentação das Regras:
- **[.cursor/rules/README.md](.cursor/rules/README.md)** - Como usar as regras do Cursor
- **[.cursor/RULES_OVERVIEW.md](.cursor/RULES_OVERVIEW.md)** - Visão geral completa das regras

---

## 🔄 Refatoração Recente

**Contexto do Usuário e Schema do Banco**

### Documentos da Refatoração:
1. **[REFACTORING_SUMMARY.md](REFACTORING_SUMMARY.md)** - Resumo completo da refatoração
2. **[QUICK_START_REFACTORING.md](QUICK_START_REFACTORING.md)** - Comandos rápidos para aplicar
3. **[prisma/MIGRATION_GUIDE.md](prisma/MIGRATION_GUIDE.md)** - Guia detalhado da migration

**O que foi feito:**
- ✅ Schema do Prisma atualizado com novos campos
- ✅ Páginas refatoradas para usar dados reais
- ✅ Componentes atualizados com contexto do usuário
- ✅ APIs criadas para listar sites
- ✅ Login atualizado para tracking

**Próximo passo:** Executar `pnpm prisma migrate dev`

---

## 🗂️ Estrutura da Documentação

```
insighthouse/
├── README.md                        # Visão geral do projeto
├── AGENTS.md                        # Instruções para Cursor AI
├── CONTRIBUTING.md                  # Guia de contribuição
├── REFACTORING_SUMMARY.md          # Resumo da refatoração de contexto
├── QUICK_START_REFACTORING.md      # Comandos rápidos para migration
├── DOCUMENTATION_INDEX.md          # Este arquivo
│
├── .cursor/
│   ├── rules/
│   │   ├── README.md               # Documentação das regras
│   │   ├── architecture.mdc        # Arquitetura geral
│   │   ├── react-components.mdc    # Componentes React
│   │   ├── api-routes.mdc          # Rotas de API
│   │   ├── database-prisma.mdc     # Database e Prisma
│   │   ├── authentication-security.mdc  # Auth e segurança
│   │   ├── typescript-utilities.mdc     # TypeScript
│   │   ├── testing.mdc             # Testes
│   │   ├── documentation.mdc       # Documentação
│   │   ├── template-component.mdc  # Templates de componentes
│   │   └── template-api-route.mdc  # Templates de APIs
│   │
│   └── RULES_OVERVIEW.md           # Visão geral das regras
│
└── prisma/
    ├── schema.prisma                # Schema do banco de dados
    └── MIGRATION_GUIDE.md           # Guia de migration
```

---

## 📖 Guias por Contexto

### 🆕 Novo Desenvolvedor

**Leitura recomendada:**
1. README.md - Setup do projeto
2. CONTRIBUTING.md - Como contribuir
3. AGENTS.md - Entender a arquitetura
4. .cursor/rules/README.md - Como usar as regras

### 🏗️ Implementando Feature Nova

**Leitura recomendada:**
1. AGENTS.md - Seção "Adding a New Feature"
2. @template-component - Para criar componentes
3. @template-api-route - Para criar APIs
4. database-prisma.mdc - Para alterar schema

### 🐛 Corrigindo Bugs

**Leitura recomendada:**
1. architecture.mdc - Princípios gerais
2. Regra específica do arquivo sendo modificado
3. testing.mdc - Para adicionar testes

### 🔒 Trabalhando com Segurança

**Leitura recomendada:**
1. authentication-security.mdc - Padrões de auth
2. api-routes.mdc - Proteção de endpoints
3. database-prisma.mdc - Row-level security

### 🎨 Trabalhando com UI

**Leitura recomendada:**
1. react-components.mdc - Padrões de componentes
2. template-component.mdc - Templates prontos
3. architecture.mdc - Tailwind organization

### 🗄️ Trabalhando com Database

**Leitura recomendada:**
1. database-prisma.mdc - Padrões do Prisma
2. prisma/MIGRATION_GUIDE.md - Como criar migrations
3. architecture.mdc - Performance best practices

---

## 🔍 Busca Rápida

### Preciso saber como...

**...criar um novo componente?**
→ Leia: `template-component.mdc`

**...criar uma nova API?**
→ Leia: `template-api-route.mdc`

**...alterar o schema do banco?**
→ Leia: `database-prisma.mdc` + `MIGRATION_GUIDE.md`

**...implementar autenticação?**
→ Leia: `authentication-security.mdc`

**...escrever testes?**
→ Leia: `testing.mdc`

**...nomear arquivos e variáveis?**
→ Leia: `architecture.mdc` → "Naming Conventions"

**...organizar imports?**
→ Leia: `architecture.mdc` → "Import Order"

**...validar dados do usuário?**
→ Leia: `api-routes.mdc` → "Request Validation"

**...aplicar a refatoração recente?**
→ Leia: `QUICK_START_REFACTORING.md`

---

## 📊 Status da Documentação

| Categoria | Arquivos | Status | Completude |
|-----------|----------|--------|------------|
| **Visão Geral** | 3 | ✅ Completo | 100% |
| **Regras Cursor** | 11 | ✅ Completo | 100% |
| **Refatoração** | 3 | ✅ Completo | 100% |
| **Database** | 2 | ✅ Completo | 100% |
| **Total** | **19 arquivos** | ✅ | **100%** |

---

## 🎓 Recursos de Aprendizado

### Links Externos:

- **Next.js 15 Docs:** https://nextjs.org/docs
- **Prisma Docs:** https://www.prisma.io/docs
- **Tailwind CSS:** https://tailwindcss.com/docs
- **Radix UI:** https://www.radix-ui.com/primitives/docs
- **Zod:** https://zod.dev
- **Cursor Rules:** https://docs.cursor.com/pt-BR/context/rules
- **Clean Code:** https://www.amazon.com/Clean-Code-Handbook-Software-Craftsmanship/dp/0132350882

### Documentação Interna:

- **Padrões de Código:** `.cursor/rules/`
- **Arquitetura:** `AGENTS.md`
- **Contribuição:** `CONTRIBUTING.md`
- **Troubleshooting:** `README.md` → seção "Troubleshooting"

---

## 🔄 Mantendo a Documentação Atualizada

### Quando atualizar:

- ✅ Ao adicionar novos campos ao schema
- ✅ Ao criar novos padrões de código
- ✅ Ao implementar novas features
- ✅ Ao corrigir bugs importantes
- ✅ Ao alterar a arquitetura

### Como atualizar:

1. Edite o arquivo relevante em `.cursor/rules/` ou raiz
2. Mantenha o formato e estrutura existentes
3. Adicione exemplos práticos quando possível
4. Teste que a documentação está correta
5. Commit com mensagem descritiva

---

## ✨ Resumo

Este projeto possui **documentação completa e atualizada** cobrindo:

✅ **Arquitetura e padrões de código**
✅ **Guias de desenvolvimento**
✅ **Templates reutilizáveis**
✅ **Segurança e autenticação**
✅ **Database e migrations**
✅ **Testes e qualidade**
✅ **Refatorações recentes**

**Tudo está pronto para desenvolvimento profissional e escalável!** 🚀

---

**Última atualização:** Outubro 2025
**Versão:** 2.0.0
**Mantido por:** Equipe InsightHouse


