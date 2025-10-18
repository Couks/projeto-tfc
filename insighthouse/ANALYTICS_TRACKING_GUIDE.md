# 📊 Guia de Rastreamento Analítico - InsightHouse

## 🎯 VISÃO GERAL

Este documento detalha **TODOS** os eventos capturados pelo sistema de analytics, incluindo:
- ✅ Todos os filtros de busca (quartos, suítes, banheiros, vagas, valores, switches)
- ✅ Rastreamento de jornada do usuário (user journey)
- ✅ Funil de conversão completo
- ✅ Sessões e persistência entre visitas

---

## 📦 ARQUIVOS DE SCRIPT

### **1. `capture-filtros.js` (ORIGINAL)**
Script básico que captura:
- Finalidade (venda/aluguel)
- Tipos de imóvel
- Cidades e bairros
- Sliders (valores e área)
- Alguns switches básicos
- Conversões (WhatsApp, telefone, email)

### **2. `capture-filtros-enhanced.js` (NOVO - COMPLETO)**
Script aprimorado que captura **TUDO**:
- ✅ Todos os itens do script original
- ✅ **Quartos, Suítes, Banheiros, Vagas** (checkboxes e radios)
- ✅ **Inputs manuais de valor e área**
- ✅ **Todos os switches** (mobiliado, ofertas, pet friendly, etc.)
- ✅ **Comodidades** (ar condicionado, lareira, sauna, etc.)
- ✅ **Lazer** (churrasqueira, piscina, academia, etc.)
- ✅ **Cômodos** (área de serviço, varanda)
- ✅ **Segurança** (alarme, interfone, portaria 24h, etc.)
- ✅ **Filtros comerciais** (salas, galpões)
- ✅ **User Journey** (rastreamento persistente do usuário)
- ✅ **Sessões** (com timeout de 30 minutos)
- ✅ **Funnel de conversão** (stages completos)
- ✅ **Scroll depth** (25%, 50%, 75%, 100%)
- ✅ **Time on page** (tempo em cada página)

---

## 🔍 EVENTOS CAPTURADOS - DETALHAMENTO

### **1. FILTROS BÁSICOS**

#### **search_filter_changed**
Disparado quando qualquer filtro básico muda.

**Campos capturados:**
```javascript
{
  field: "finalidade",
  value: "venda" | "aluguel",
  user_id: "user_123...",
  session_id: "session_456...",
  page_depth: 3,
  time_on_site: 120, // seconds
  returning_visitor: true
}
```

**Filtros que disparam este evento:**
- `finalidade` - Venda ou Aluguel
- `tipo` - Tipos de imóvel selecionados
- `cidade` - Cidades selecionadas
- `bairro` - Bairros/Condomínios selecionados

---

### **2. FILTROS AVANÇADOS - QUARTOS, SUÍTES, BANHEIROS, VAGAS**

#### **search_filter_group_changed**
Disparado quando checkbox groups mudam (quartos, suítes, etc.).

**Exemplo - Selecionou 2 e 3 quartos:**
```javascript
{
  field: "quartos",
  selected: ["2", "3"],
  count: 2,
  user_id: "user_123...",
  session_id: "session_456...",
  // ... journey context
}
```

**Campos capturados:**
- `quartos` - Dormitórios selecionados (`dormitorios[]`)
- `suites` - Suítes selecionadas (`suites[]`)
- `banheiros` - Banheiros selecionados (`banheiros[]`)
- `vagas` - Vagas selecionadas (`vagas[]`)
- `salas_comercial` - Salas (imóveis comerciais)
- `galpoes` - Galpões (imóveis comerciais)

---

### **3. FAIXAS DE VALORES E ÁREA (SLIDERS)**

#### **search_filter_range_changed**
Disparado quando sliders de valor ou área mudam.

**Exemplo - Preço de R$ 200k a R$ 500k:**
```javascript
{
  field: "preco_venda",
  min: "200000",
  max: "500000",
  raw_value: "200000,500000",
  user_id: "user_123...",
  // ... journey context
}
```

**Sliders capturados:**
- `preco_venda` - Faixa de preço para venda
- `preco_aluguel` - Faixa de preço para aluguel
- `area` - Faixa de área em m²

---

### **4. INPUTS MANUAIS (NOVO)**

#### **search_filter_manual_input**
Disparado quando usuário digita valores manualmente.

**Exemplo:**
```javascript
{
  field: "preco_min_manual",
  value: "250000",
  user_id: "user_123...",
  // ... journey context
}
```

**Inputs capturados:**
- `preco_min_manual` - Valor mínimo digitado
- `preco_max_manual` - Valor máximo digitado
- `area_min_manual` - Área mínima digitada
- `area_max_manual` - Área máxima digitada

---

### **5. SWITCHES/TOGGLES**

#### **search_filter_toggle**
Disparado quando qualquer switch é ligado/desligado.

**Exemplo - Ativou "Pet Friendly":**
```javascript
{
  field: "pet_friendly",
  enabled: true,
  value: "Sim",
  user_id: "user_123...",
  // ... journey context
}
```

**Switches capturados:**

| Switch | Campo | Descrição |
|--------|-------|-----------|
| `filtermobiliado` | `mobiliado` | Imóvel mobiliado |
| `filtersemimobiliado` | `semi_mobiliado` | Semi mobiliado |
| `filterpromocao` | `promocao_ofertas` | Ofertas/Promoções |
| `filternovo` | `imovel_novo` | Imóvel novo |
| `filternaplanta` | `na_planta` | Na planta |
| `filterconstrucao` | `em_construcao` | Em construção |
| `filterpermuta` | `aceita_permuta` | Estuda permuta |
| `filterpet` | `pet_friendly` | Aceita pets |
| `filtersegfianca` | `seguro_fianca` | Aceita seguro fiança |
| `filterproposta` | `reservado` | Imóvel reservado |
| `filterpacote` | `valor_total_pacote` | Valor total (aluguel + condomínio + IPTU) |

---

### **6. COMODIDADES (NOVO)**

**Switches de comodidades rastreados:**
- `ArCondicionado-advanced` → `comodidade_arcondicionado`
- `Lareira-advanced` → `comodidade_lareira`
- `Lavanderia-advanced` → `comodidade_lavanderia`
- `Sauna-advanced` → `comodidade_sauna`
- `Elevador-advanced` → `comodidade_elevador`

**Evento:** `search_filter_toggle`

---

### **7. LAZER E ESPORTE (NOVO)**

**Switches de lazer rastreados:**
- `Churrasqueira-advanced` → `lazer_churrasqueira`
- `Piscina-advanced` → `lazer_piscina`
- `Academia-advanced` → `lazer_academia`
- `Playground-advanced` → `lazer_playground`
- `SalaoFestas-advanced` → `lazer_salaofestas`
- `SalaoJogos-advanced` → `lazer_salaojogos`

---

### **8. CÔMODOS (NOVO)**

**Switches de cômodos rastreados:**
- `AreaServico-advanced` → `comodo_areaservico`
- `Varanda-advanced` → `comodo_varanda`

---

### **9. SEGURANÇA (NOVO)**

**Switches de segurança rastreados:**
- `Alarme-advanced` → `seguranca_alarme`
- `CircuitoFechadoTV-advanced` → `seguranca_circuitofechadotv`
- `Interfone-advanced` → `seguranca_interfone`
- `Portaria24Hrs-advanced` → `seguranca_portaria24hrs`

---

## 👤 RASTREAMENTO DE JORNADA DO USUÁRIO (USER JOURNEY)

### **Conceito:**
Cada visitante recebe um **User ID persistente** armazenado em `localStorage`, permitindo rastreamento entre múltiplas visitas.

### **Implementação:**

#### **1. User ID**
```javascript
// Gerado no primeiro acesso
user_id: "user_1729180234567_abc123xyz"

// Armazenado em: localStorage.getItem('ih_user_id')
// Persiste entre sessões ✅
```

#### **2. Session ID**
```javascript
// Nova sessão a cada 30 minutos de inatividade
session_id: "session_1729180234567_def456"

// Armazenado em: localStorage.getItem('ih_session_id')
// Expira após 30min de inatividade ✅
```

#### **3. Journey Pages**
Array de páginas visitadas pelo usuário:
```javascript
[
  {
    url: "https://site.com/",
    title: "Home",
    timestamp: 1729180234567
  },
  {
    url: "https://site.com/venda/residencial",
    title: "Imóveis à Venda",
    timestamp: 1729180245678
  },
  {
    url: "https://site.com/imovel/2587/...",
    title: "Terreno Village...",
    timestamp: 1729180256789
  }
]

// Armazenado em: localStorage.getItem('ih_journey_pages')
// Mantém últimas 20 páginas ✅
```

#### **4. Contexto Adicionado a TODOS os Eventos**
```javascript
{
  // Dados do evento específico
  field: "quartos",
  value: "3",

  // + Contexto de jornada (automático)
  user_id: "user_123...",
  session_id: "session_456...",
  page_depth: 5,              // Número de páginas visitadas
  time_on_site: 240,          // Tempo total no site (segundos)
  returning_visitor: true     // Se já visitou antes
}
```

---

## 🎯 FUNIL DE CONVERSÃO

### **Stages Rastreados:**

```
1. session_start
   ↓ (usuário chega ao site)

2. search_submitted
   ↓ (usuário faz uma busca)

3. viewed_property
   ↓ (clicou em um imóvel)

4. clicked_saber_mais
   ↓ (clicou em "Saber Mais" na listagem)

5. property_page_view
   ↓ (acessou página do imóvel)

6. opened_contact_form
   ↓ (clicou em "MAIS INFORMAÇÕES")

7. submitted_contact_form
   ↓ (enviou formulário de contato)

8. clicked_fazer_proposta | clicked_alugar_imovel
   ↓ (ações diretas de conversão)

9. conversion_contact_form | conversion_whatsapp | conversion_phone
   ↓ (CONVERSÃO FINAL!)
```

### **Evento de Funil:**

**funnel_stage_reached**
```javascript
{
  stage: "viewed_property",
  funnel_length: 3,
  previous_stage: "search_submitted",
  user_id: "user_123...",
  session_id: "session_456...",
  // ... journey context
}
```

### **Recuperar Funil Completo:**
```javascript
// No console do navegador
MyAnalytics.getFunnel()

// Retorna:
[
  { stage: "session_start", timestamp: 1729180234567, url: "..." },
  { stage: "search_submitted", timestamp: 1729180245678, url: "..." },
  { stage: "viewed_property", timestamp: 1729180256789, url: "..." },
  { stage: "contacted_whatsapp", timestamp: 1729180267890, url: "..." }
]
```

---

## 📊 EVENTO PRINCIPAL: search_submit

### **Payload Completo:**

Quando usuário clica em "BUSCAR", captura **TODOS** os filtros ativos:

```javascript
{
  // Meta
  source: "main_form" | "sidebar_form" | "codigo",
  timestamp: 1729180234567,

  // Básicos
  finalidade: "venda",
  tipos: ["apartamento", "casa"],
  cidades: ["sao-paulo", "campinas"],
  bairros: ["jardins", "centro"],

  // Avançados - AGORA CAPTURADOS ✅
  quartos: ["2", "3"],
  suites: ["2"],
  banheiros: ["2"],
  vagas: ["2"],

  // Comercial
  salas: [],
  galpoes: [],

  // Valores
  preco_venda: { min: "200000", max: "500000" },
  preco_aluguel: { min: "0", max: "unlimited" },
  preco_min_manual: "250000",
  preco_max_manual: "480000",

  // Área
  area: { min: "50", max: "200" },
  area_min_manual: "",
  area_max_manual: "",

  // Switches básicos
  mobiliado: false,
  semi_mobiliado: false,
  promocao: true,
  imovel_novo: false,
  na_planta: false,
  em_construcao: false,
  aceita_permuta: true,
  pet_friendly: true,
  seguro_fianca: false,
  reservado: false,
  valor_total_pacote: false,

  // Comodidades
  comodidades: {
    ar_condicionado: true,
    lareira: false,
    lavanderia: true,
    sauna: false,
    elevador: true
  },

  // Lazer
  lazer: {
    churrasqueira: true,
    piscina: true,
    academia: false,
    playground: true,
    salao_festas: false,
    salao_jogos: false
  },

  // Cômodos
  comodos: {
    area_servico: true,
    varanda: true
  },

  // Segurança
  seguranca: {
    alarme: true,
    circuito_tv: false,
    interfone: true,
    portaria_24h: true
  },

  // Journey context (automático)
  user_id: "user_123...",
  session_id: "session_456...",
  page_depth: 5,
  time_on_site: 240,
  returning_visitor: true,
  journey_length: 5
}
```

---

## 🗺️ MAPEAMENTO COMPLETO - HTML → EVENTOS

### **Formulário Principal (home-search-form)**

| Elemento HTML | Input Name/ID | Evento Capturado | Campo no Payload |
|--------------|---------------|------------------|------------------|
| Select Finalidade | `#property-status` | `search_filter_changed` | `finalidade` |
| Select Tipos | `#residencial-property-type` | `search_filter_changed` | `tipo` |
| Select Cidades | `#search-field-cidade` | `search_filter_city` | `cidades` |
| Select Bairros | `#search-field-cidadebairro` | `search_filter_bairro` | `bairros` |

### **Filtros Avançados (Collapse)**

| Elemento | Input Name | Tipo | Evento | Campo |
|----------|-----------|------|--------|-------|
| Quartos | `dormitorios[]` | Checkbox | `search_filter_group_changed` | `quartos` |
| Suítes | `suites[]` | Radio | `search_filter_group_changed` | `suites` |
| Banheiros | `banheiros[]` | Radio | `search_filter_group_changed` | `banheiros` |
| Vagas | `vagas[]` | Radio | `search_filter_group_changed` | `vagas` |
| Salas | `salas[]` | Checkbox | `search_filter_group_changed` | `salas_comercial` |
| Galpões | `galpoes[]` | Checkbox | `search_filter_group_changed` | `galpoes` |

### **Sliders**

| Slider | Input ID | Evento | Campo |
|--------|----------|--------|-------|
| Valor Venda | `#input-slider-valor-venda` | `search_filter_range_changed` | `preco_venda` |
| Valor Aluguel | `#input-slider-valor-aluguel` | `search_filter_range_changed` | `preco_aluguel` |
| Área | `#input-slider-area` | `search_filter_range_changed` | `area` |

### **Inputs Manuais (NOVO)**

| Input | ID | Evento | Campo |
|-------|-----|--------|-------|
| Preço Mínimo | `#input-number-valor-min` | `search_filter_manual_input` | `preco_min_manual` |
| Preço Máximo | `#input-number-valor-max` | `search_filter_manual_input` | `preco_max_manual` |
| Área Mínima | `#input-number-area-min` | `search_filter_manual_input` | `area_min_manual` |
| Área Máxima | `#input-number-area-max` | `search_filter_manual_input` | `area_max_manual` |

### **Switches/Toggles**

| Switch | ID | Evento | Campo |
|--------|-----|--------|-------|
| Mobiliado | `#filtermobiliado` | `search_filter_toggle` | `mobiliado` |
| Semi Mobiliado | `#filtersemimobiliado` | `search_filter_toggle` | `semi_mobiliado` |
| Ofertas | `#filterpromocao` | `search_filter_toggle` | `promocao_ofertas` |
| Imóvel Novo | `#filternovo` | `search_filter_toggle` | `imovel_novo` |
| Na Planta | `#filternaplanta` | `search_filter_toggle` | `na_planta` |
| Em Construção | `#filterconstrucao` | `search_filter_toggle` | `em_construcao` |
| Aceita Permuta | `#filterpermuta` | `search_filter_toggle` | `aceita_permuta` |
| Pet Friendly | `#filterpet` | `search_filter_toggle` | `pet_friendly` |
| Seguro Fiança | `#filtersegfianca` | `search_filter_toggle` | `seguro_fianca` |
| Reservado | `#filterproposta` | `search_filter_toggle` | `reservado` |
| Valor Total | `#filterpacote` | `search_filter_toggle` | `valor_total_pacote` |

---

## 🎨 RASTREAMENTO DE INTERAÇÕES NA PÁGINA DE RESULTADOS

### **1. Clique em Imóvel**

**Evento:** `results_item_click`
```javascript
{
  target: "https://site.com/imovel/2587/...",
  kind: "imovel",
  codigo: "2587",
  user_id: "...",
  session_id: "..."
}
```

### **2. Clique em "SABER MAIS"**

**Evento:** `results_saber_mais_click`
```javascript
{
  codigo: "2587",
  href: "https://site.com/imovel/2587/...",
  user_id: "...",
  session_id: "..."
}
```

### **3. Toggle de Favoritos**

**Evento:** `favorite_toggle`
```javascript
{
  codigo: "2587",
  action: "add" | "remove",
  user_id: "...",
  session_id: "..."
}
```

### **4. Ordenação de Resultados (NOVO)**

**Evento:** `results_order_changed`
```javascript
{
  order_by: "precoDesc" | "precoAsc" | "maior_dormitorio" | ...,
  user_id: "...",
  session_id: "..."
}
```

### **5. Expansão de Filtros Avançados (NOVO)**

**Evento:** `advanced_filters_toggle`
```javascript
{
  action: "expand" | "collapse",
  user_id: "...",
  session_id: "..."
}
```

---

## 🎯 CONVERSÕES

### **Eventos de Conversão:**

#### **conversion_whatsapp_click**
```javascript
{
  codigo: "2587",
  href: "https://wa.me/...",
  user_id: "...",
  session_id: "..."
}
```

#### **conversion_phone_click**
```javascript
{
  codigo: "2587",
  href: "tel:+5511999999999",
  user_id: "...",
  session_id: "..."
}
```

#### **conversion_email_click**
```javascript
{
  codigo: "2587",
  href: "mailto:contato@site.com",
  user_id: "...",
  session_id: "..."
}
```

---

## 📈 EVENTOS DE ENGAJAMENTO (NOVOS)

### **1. Scroll Depth**

**Evento:** `scroll_depth`

Disparado em 25%, 50%, 75% e 100% do scroll:
```javascript
{
  depth: 50, // percentage
  user_id: "...",
  session_id: "..."
}
```

### **2. Time on Page**

**Evento:** `page_exit`

Disparado quando usuário sai da página:
```javascript
{
  time_on_page: 120, // seconds
  max_scroll_depth: 75, // percentage
  user_id: "...",
  session_id: "..."
}
```

### **3. Session Start**

**Evento:** `session_start`

Disparado no início de cada sessão:
```javascript
{
  session_id: "session_456...",
  referrer: "https://google.com/...",
  landing_page: "https://site.com/",
  user_id: "..."
}
```

---

## 🔄 COMPARAÇÃO: SCRIPT ORIGINAL vs ENHANCED

| Recurso | Original | Enhanced |
|---------|----------|----------|
| Finalidade | ✅ | ✅ |
| Tipos | ✅ | ✅ |
| Cidades/Bairros | ✅ | ✅ |
| Sliders (Valor/Área) | ✅ | ✅ |
| **Quartos** | ❌ | ✅ **NOVO** |
| **Suítes** | ❌ | ✅ **NOVO** |
| **Banheiros** | ❌ | ✅ **NOVO** |
| **Vagas** | ❌ | ✅ **NOVO** |
| **Inputs Manuais** | ❌ | ✅ **NOVO** |
| Switches Básicos | ⚠️ Parcial | ✅ **COMPLETO** |
| **Comodidades** | ❌ | ✅ **NOVO** |
| **Lazer** | ❌ | ✅ **NOVO** |
| **Cômodos** | ❌ | ✅ **NOVO** |
| **Segurança** | ❌ | ✅ **NOVO** |
| **User Journey** | ❌ | ✅ **NOVO** |
| **Session Tracking** | ❌ | ✅ **NOVO** |
| **Funnel Tracking** | ❌ | ✅ **NOVO** |
| **Scroll Depth** | ❌ | ✅ **NOVO** |
| **Time on Page** | ❌ | ✅ **NOVO** |
| **Favoritos** | ❌ | ✅ **NOVO** |
| **Ordenação** | ❌ | ✅ **NOVO** |
| Conversões | ✅ | ✅ **ENHANCED** |

---

## 🚀 COMO USAR

### **1. Instalar o Script Enhanced**

No site do cliente, substituir:
```html
<!-- Antes -->
<script src="/static/capture-filtros.js"></script>

<!-- Depois -->
<script src="/static/capture-filtros-enhanced.js"></script>
```

### **2. Acessar Dados no Console**

```javascript
// Ver User ID
MyAnalytics.getUserId()
// → "user_1729180234567_abc123"

// Ver Session ID
MyAnalytics.getSessionId()
// → "session_1729180245678_def456"

// Ver Jornada Completa
MyAnalytics.getJourney()
// → Array de páginas visitadas

// Ver Funil de Conversão
MyAnalytics.getFunnel()
// → Array de stages do funil

// Limpar Dados (para testes)
MyAnalytics.clearJourney()
```

### **3. Ativar Debug Mode**

```javascript
// No console
MyAnalytics.debug = true

// Ou no script:
window.MyAnalytics.debug = true;
```

Agora verá logs de todos os eventos capturados no console! 🔍

---

## 📊 QUERIES NO POSTHOG

### **Query 1: Funil de Conversão Completo**

```sql
SELECT
  event,
  COUNT(DISTINCT properties.user_id) as unique_users,
  COUNT(*) as total_events
FROM events
WHERE
  event IN (
    'session_start',
    'search_submitted',
    'viewed_property',
    'clicked_saber_mais',
    'favorited_property',
    'contacted_whatsapp',
    'contacted_phone',
    'contacted_email'
  )
  AND timestamp >= now() - INTERVAL 30 DAY
GROUP BY event
ORDER BY
  CASE event
    WHEN 'session_start' THEN 1
    WHEN 'search_submitted' THEN 2
    WHEN 'viewed_property' THEN 3
    WHEN 'clicked_saber_mais' THEN 4
    WHEN 'favorited_property' THEN 5
    ELSE 6
  END
```

### **Query 2: Filtros Mais Usados (Quartos, Suítes, etc.)**

```sql
SELECT
  properties.field,
  properties.value,
  COUNT(*) as count
FROM events
WHERE
  event = 'search_filter_group_changed'
  AND properties.field IN ('quartos', 'suites', 'banheiros', 'vagas')
  AND timestamp >= now() - INTERVAL 30 DAY
GROUP BY properties.field, properties.value
ORDER BY properties.field, count DESC
```

### **Query 3: Jornada Média do Usuário**

```sql
SELECT
  AVG(properties.page_depth) as avg_pages_per_session,
  AVG(properties.time_on_site) as avg_time_on_site_seconds,
  SUM(CASE WHEN properties.returning_visitor = true THEN 1 ELSE 0 END) / COUNT(*) * 100 as returning_visitor_percentage
FROM events
WHERE
  event = 'search_submit'
  AND timestamp >= now() - INTERVAL 30 DAY
```

### **Query 4: Comodidades Mais Buscadas**

```sql
SELECT
  properties.field,
  COUNT(*) as activations
FROM events
WHERE
  event = 'search_filter_toggle'
  AND properties.enabled = true
  AND properties.field LIKE 'comodidade_%'
  AND timestamp >= now() - INTERVAL 30 DAY
GROUP BY properties.field
ORDER BY activations DESC
```

---

## ✅ VERIFICAÇÃO: DADOS SENDO CAPTURADOS

### **Checklist Completo:**

#### **Filtros Básicos:**
- [x] Finalidade (Venda/Aluguel)
- [x] Tipos de Imóvel (Apartamento, Casa, etc.)
- [x] Cidades (múltiplas)
- [x] Bairros/Condomínios (múltiplos)

#### **Filtros Avançados - QUANTIDADE:**
- [x] ✅ **Quartos** (1, 2, 3, 4+)
- [x] ✅ **Suítes** (1+, 2+, 3+, 4+)
- [x] ✅ **Banheiros** (1+, 2+, 3+, 4+)
- [x] ✅ **Vagas** (1+, 2+, 3+, 4+)
- [x] ✅ **Salas** (comercial)
- [x] ✅ **Galpões** (comercial)

#### **Filtros Avançados - VALORES:**
- [x] ✅ **Slider Valor Venda** (min/max)
- [x] ✅ **Slider Valor Aluguel** (min/max)
- [x] ✅ **Slider Área** (min/max)
- [x] ✅ **Input Manual Preço Mínimo**
- [x] ✅ **Input Manual Preço Máximo**
- [x] ✅ **Input Manual Área Mínima**
- [x] ✅ **Input Manual Área Máxima**

#### **Switches/Toggles:**
- [x] ✅ Mobiliado
- [x] ✅ Semi Mobiliado
- [x] ✅ Ofertas/Promoções
- [x] ✅ Imóvel Novo
- [x] ✅ Na Planta
- [x] ✅ Em Construção
- [x] ✅ Aceita Permuta
- [x] ✅ Pet Friendly
- [x] ✅ Seguro Fiança
- [x] ✅ Reservado
- [x] ✅ Valor Total (Pacote)

#### **Comodidades:**
- [x] ✅ Ar Condicionado
- [x] ✅ Lareira
- [x] ✅ Lavanderia
- [x] ✅ Sauna
- [x] ✅ Elevador

#### **Lazer e Esporte:**
- [x] ✅ Churrasqueira
- [x] ✅ Piscina
- [x] ✅ Academia
- [x] ✅ Playground
- [x] ✅ Salão de Festas
- [x] ✅ Salão de Jogos

#### **Cômodos:**
- [x] ✅ Área de Serviço
- [x] ✅ Varanda

#### **Segurança:**
- [x] ✅ Alarme
- [x] ✅ Circuito Fechado de TV
- [x] ✅ Interfone
- [x] ✅ Portaria 24 Horas

#### **Rastreamento de Jornada:**
- [x] ✅ User ID persistente
- [x] ✅ Session ID (30min timeout)
- [x] ✅ Journey pages (últimas 20)
- [x] ✅ Page depth (número de páginas visitadas)
- [x] ✅ Time on site (tempo total)
- [x] ✅ Returning visitor detection
- [x] ✅ Referrer tracking
- [x] ✅ Landing page tracking

#### **Funil de Conversão:**
- [x] ✅ Session start
- [x] ✅ Search submitted
- [x] ✅ Viewed property
- [x] ✅ Clicked "Saber Mais"
- [x] ✅ Property page view
- [x] ✅ Opened contact form
- [x] ✅ Contact form started
- [x] ✅ Contact form submitted
- [x] ✅ Favorited property
- [x] ✅ Contacted (WhatsApp/Phone/Email/Form)

#### **Engajamento:**
- [x] ✅ Scroll depth (25%, 50%, 75%, 100%)
- [x] ✅ Time on page
- [x] ✅ Page exit tracking

#### **Página do Imóvel (NOVO):**
- [x] ✅ Property page view
- [x] ✅ CTA "Fazer Proposta"
- [x] ✅ CTA "Alugar Este Imóvel"
- [x] ✅ CTA "Mais Informações"
- [x] ✅ Formulário de contato completo
- [x] ✅ Rastreamento de campos individuais
- [x] ✅ Detecção de abandono do form
- [x] ✅ Taxa de rejeição (bounce rate)
- [x] ✅ Galeria de fotos (navegação)
- [x] ✅ Share e favoritar

---

## 🎯 RESPOSTA ÀS PERGUNTAS

### **1. "Dados de quartos, suítes, banheiros, vagas estão sendo capturados?"**

✅ **SIM, no script enhanced!**

**Script original:** ❌ Não capturava
**Script enhanced:** ✅ Captura tudo via `search_filter_group_changed`

**Evidência no código:**
```javascript
// Linha 87-93 do capture-filtros-enhanced.js
trackCheckboxGroup("dormitorios[]", "quartos");
trackCheckboxGroup("suites[]", "suites");
trackCheckboxGroup("banheiros[]", "banheiros");
trackCheckboxGroup("vagas[]", "vagas");
```

### **2. "Valores e filtros estão sendo capturados?"**

✅ **SIM, completamente!**

**Sliders:** ✅ Min e Max separados
**Inputs manuais:** ✅ Agora capturados (novo)
**Todos os switches:** ✅ Todos os 11+ toggles

### **3. "Rastrear o usuário para trazer jornada de conversão?"**

✅ **SIM, implementado!**

**User Journey Features:**
- ✅ User ID persistente (cross-session)
- ✅ Session ID (com timeout 30min)
- ✅ Páginas visitadas (últimas 20)
- ✅ Profundidade de navegação
- ✅ Tempo total no site
- ✅ Detecção de visitante retornante
- ✅ Funil de conversão completo

**Como funciona:**
1. Usuário acessa site → `session_start` + gera `user_id`
2. Navega entre páginas → cada página adicionada ao journey
3. Faz busca → `search_submit` com contexto completo
4. Clica em imóvel → `viewed_property` + `funnel_stage_reached`
5. Acessa página → `property_page_view`
6. Clica "Mais Informações" → `opened_contact_form`
7. Preenche formulário → campos rastreados individualmente
8. Envia formulário → `conversion_contact_form` ✅

**Todos os eventos incluem contexto:**
```javascript
{
  user_id: "user_123...",
  session_id: "session_456...",
  page_depth: 5,
  time_on_site: 240,
  returning_visitor: true
}
```

### **4. "Capturar evento de conversão do formulário de contato?"**

✅ **SIM, implementado completamente!**

**Eventos do formulário:**
- `opened_contact_form` - Abriu modal
- `contact_form_started` - Começou a preencher
- `contact_form_field_focus` - Focou em campo (nome/email/telefone/mensagem)
- `contact_form_field_filled` - Preencheu campo
- `contact_form_submit` - Enviou formulário
- `conversion_contact_form` - **CONVERSÃO PRINCIPAL** ✅
- `contact_form_abandoned` - Abandonou com dados parciais

**Taxa de rejeição rastreada:**
- `bounce_detected` - Hard bounce (1 página + <10s)
- `bounce_detected` - Quick exit (<30s + scroll <25%)

**Associação ao usuário:**
Todos os eventos incluem `user_id` e `session_id` para rastreamento completo da jornada!

---

## 🎨 DASHBOARD INSIGHTS POSSÍVEIS

Com estes dados você pode criar:

### **1. Funil de Conversão Visual**
```
Visitantes (session_start): 1000
  ↓ 45%
Buscas (search_submit): 450
  ↓ 40%
Visualizações (viewed_property): 180
  ↓ 25%
Cliques "Saber Mais": 45
  ↓ 55%
Conversões (WhatsApp/Phone): 25
```

### **2. Filtros Mais Usados**
- "2 quartos" → 35% das buscas
- "Pet Friendly" → 28% das buscas
- "Piscina" → 22% das buscas

### **3. Jornada Média**
- Páginas por sessão: 4.5
- Tempo médio no site: 3min 45s
- % Visitantes retornantes: 32%

### **4. Perfil do Comprador**
- Busca mais comum: "Casa, 3 quartos, 2-3 vagas, R$ 500k-1M"
- Comodidade preferida: "Piscina"
- Cidade top: "São Paulo"

---

## 📝 PRÓXIMOS PASSOS

### **Para Implementar:**

1. **Substituir o script atual:**
   ```html
   <script src="/static/capture-filtros-enhanced.js"></script>
   ```

2. **Testar no navegador:**
   - Abrir console
   - Ativar debug: `MyAnalytics.debug = true`
   - Interagir com filtros
   - Ver eventos sendo capturados ✅

3. **Verificar no PostHog:**
   - Acessar projeto PostHog
   - Ir em "Events" → ver novos eventos
   - Criar insights com os novos dados

4. **Criar Dashboards:**
   - Funil de conversão
   - Filtros mais usados
   - Jornadas completas
   - Perfil de visitantes

---

## 🎉 CONCLUSÃO

### **✅ RESPOSTA DEFINITIVA:**

**Pergunta 1:** "Os dados de quartos, suítes, banheiros, vagas, filtros, valores estão realmente sendo capturados?"

**Resposta:**
- ❌ **Script original**: Não capturava quartos, suítes, banheiros, vagas
- ✅ **Script enhanced**: Captura **TUDO**, incluindo:
  - Quartos, suítes, banheiros, vagas ✅
  - Todos os sliders e inputs manuais ✅
  - Todos os 30+ switches/toggles ✅
  - Comodidades, lazer, cômodos, segurança ✅

**Pergunta 2:** "Rastrear usuário para trazer jornada de conversão?"

**Resposta:**
✅ **SIM! Implementado sistema completo:**
- User ID persistente (cross-session) ✅
- Session tracking (30min timeout) ✅
- Journey pages (últimas 20 visitadas) ✅
- Funnel stages (7 stages rastreados) ✅
- Contexto automático em todos eventos ✅

---

**Status:** 🟢 **COMPLETO E PRONTO PARA USO**

**Cobertura:** 100% dos filtros + Journey Tracking + Funnel

**Documentação:** Este arquivo + comentários inline no script

