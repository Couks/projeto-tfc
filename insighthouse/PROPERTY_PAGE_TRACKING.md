# 🏠 Rastreamento da Página do Imóvel - InsightHouse

## 🎯 VISÃO GERAL

Sistema completo de rastreamento da **página do imóvel**, incluindo:
- ✅ Todos os botões CTA (Fazer Proposta, Alugar, Mais Informações)
- ✅ Formulário de contato completo (campos individuais + conversão)
- ✅ Detecção de abandono do formulário
- ✅ Taxa de rejeição e bounce rate
- ✅ Associação completa ao usuário (journey tracking)

---

## 📋 ELEMENTOS RASTREADOS

### **1. BOTÕES PRINCIPAIS (CTAs)**

#### **"FAZER PROPOSTA"**
```html
<a class="btn btn-primary cadastro-proposta-cta"
   href="/cadastro-de-proposta?codigo_imovel=2854">
  FAZER PROPOSTA
</a>
```

**Evento capturado:** `cta_fazer_proposta_click`
```javascript
{
  codigo: "2854",
  href: "/cadastro-de-proposta?codigo_imovel=2854",
  user_id: "user_123...",
  session_id: "session_456...",
  page_depth: 7,
  time_on_site: 420
}
```

**Funnel stage:** `clicked_fazer_proposta`

---

#### **"ALUGAR ESTE IMÓVEL"**
```html
<a class="btn btn-primary cadastro-inquilino-cta"
   href="/cadastro?codigo_imovel=2854">
  ALUGAR ESTE IMÓVEL
</a>
```

**Evento capturado:** `cta_alugar_imovel_click`
```javascript
{
  codigo: "2854",
  href: "/cadastro?codigo_imovel=2854",
  user_id: "user_123...",
  session_id: "session_456..."
}
```

**Funnel stage:** `clicked_alugar_imovel`

---

#### **"MAIS INFORMAÇÕES"** ⭐
```html
<a class="btn btn-primary"
   data-toggle="modal"
   href="#imovel-contato">
  MAIS INFORMAÇÕES
</a>
```

**Evento capturado:** `cta_mais_informacoes_click`
```javascript
{
  codigo: "2854",
  user_id: "user_123...",
  session_id: "session_456..."
}
```

**Funnel stage:** `opened_contact_form`

---

### **2. FORMULÁRIO DE CONTATO (Modal #imovel-contato)**

#### **Fluxo Completo:**

```
1. Usuário clica "MAIS INFORMAÇÕES"
   → opened_contact_form

2. Usuário digita primeiro caractere
   → contact_form_started

3. Usuário foca em "Nome"
   → contact_form_field_focus (field: "nome")

4. Usuário preenche e sai do campo
   → contact_form_field_filled (field: "nome", has_value: true)

5. Repete para email, telefone, mensagem
   → contact_form_field_focus
   → contact_form_field_filled

6. Usuário clica "Enviar"
   → contact_form_submit (com completeness: 100%)
   → conversion_contact_form ✅ CONVERSÃO!
   → funnel_stage_reached (stage: "submitted_contact_form")
```

---

### **Campos Rastreados:**

| Campo | Selector | Eventos |
|-------|----------|---------|
| **Nome** | `input[name="nome"]` | `focus`, `filled` |
| **E-mail** | `input[type="email"]` | `focus`, `filled` |
| **Celular** | `input[name="celular"]` | `focus`, `filled` |
| **Mensagem** | `textarea[name="mensagem"]` | `focus`, `filled` |

---

### **Evento: contact_form_field_focus**

Disparado quando usuário clica em um campo:

```javascript
{
  codigo: "2854",
  field: "email",
  user_id: "user_123...",
  session_id: "session_456..."
}
```

**Permite saber:**
- Quais campos recebem mais atenção
- Onde usuários começam a preencher
- Fluxo de preenchimento

---

### **Evento: contact_form_field_filled**

Disparado quando usuário preenche e sai do campo:

```javascript
{
  codigo: "2854",
  field: "telefone",
  has_value: true,
  user_id: "user_123...",
  session_id: "session_456..."
}
```

**Permite saber:**
- Quais campos são preenchidos
- Taxa de completude por campo
- Campos problemáticos (pouco preenchidos)

---

### **Evento: contact_form_submit** ⭐

Disparado quando formulário é enviado:

```javascript
{
  codigo: "2854",
  has_nome: true,
  has_email: true,
  has_telefone: true,
  has_mensagem: false,
  form_completeness: 75, // 3 de 4 campos preenchidos
  user_id: "user_123...",
  session_id: "session_456...",
  page_depth: 8,
  time_on_site: 540
}
```

**Permite saber:**
- Quais campos foram preenchidos
- % de completude do formulário
- Contexto completo do usuário

---

### **Evento: conversion_contact_form** 🎯

**EVENTO PRINCIPAL DE CONVERSÃO!**

```javascript
{
  codigo: "2854",
  contact_type: "form",
  user_id: "user_123abc...",
  session_id: "session_456def...",
  page_depth: 8,           // Visitou 8 páginas antes de converter
  time_on_site: 540,       // 9 minutos no site
  returning_visitor: false // Primeira visita
}
```

**Este evento permite:**
- ✅ Identificar usuário que converteu
- ✅ Ver jornada completa até conversão
- ✅ Calcular tempo médio até conversão
- ✅ Diferenciar novos vs retornantes
- ✅ Calcular taxa de conversão por session

---

## 🚫 RASTREAMENTO DE ABANDONO

### **Evento: contact_form_abandoned**

Disparado quando usuário fecha modal sem enviar:

```javascript
{
  codigo: "2854",
  partial_data: true, // Tinha dados preenchidos
  user_id: "user_123...",
  session_id: "session_456..."
}
```

**Detecta quando:**
- Usuário começou a preencher (digitou algo)
- Fechou modal sem clicar "Enviar"
- Dados parciais perdidos

**Permite calcular:**
- Taxa de abandono do formulário
- Onde usuários desistem
- Otimização do formulário

---

## 📊 TAXA DE REJEIÇÃO (BOUNCE RATE)

### **Evento: bounce_detected**

Disparado quando detecta comportamento de rejeição:

```javascript
{
  type: "hard_bounce" | "quick_exit",
  time_on_page: 5,        // segundos
  max_scroll: 10,         // percentual
  page_depth: 1,          // apenas 1 página
  user_id: "...",
  session_id: "..."
}
```

### **Tipos de Bounce:**

#### **Hard Bounce**
```
Critérios:
- Apenas 1 página visitada (page_depth = 1)
- Menos de 10 segundos no site
- Nenhuma interação significativa

Indica:
- Usuário não encontrou o que procurava
- Landing page ruim
- Oferta não atrativa
```

#### **Quick Exit**
```
Critérios:
- Menos de 30 segundos na página
- Scroll menor que 25%
- Saiu rapidamente

Indica:
- Conteúdo não relevante
- Página confusa
- Expectativa não atendida
```

---

## 🎨 INTERAÇÕES ADICIONAIS NA PÁGINA

### **1. Galeria de Fotos**

#### **property_gallery_navigation**
Navegação entre fotos (setas):
```javascript
{
  codigo: "2854",
  direction: "next" | "prev",
  user_id: "...",
  session_id: "..."
}
```

**Permite saber:**
- Quantas fotos usuários veem em média
- Engajamento com galeria
- Imóveis com fotos mais visualizadas

#### **property_image_click**
Clique em foto para fullscreen:
```javascript
{
  codigo: "2854",
  user_id: "...",
  session_id: "..."
}
```

---

### **2. Compartilhar**

#### **property_share_click**
Botão "Compartilhar":
```javascript
{
  codigo: "2854",
  user_id: "...",
  session_id: "..."
}
```

---

### **3. Favoritar**

#### **property_favorite_toggle**
Toggle de favorito:
```javascript
{
  codigo: "2854",
  action: "add" | "remove",
  user_id: "...",
  session_id: "..."
}
```

---

## 📈 MÉTRICAS E INSIGHTS POSSÍVEIS

### **1. Taxa de Conversão por Etapa**

```sql
WITH funnel AS (
  SELECT
    COUNT(DISTINCT CASE WHEN event = 'property_page_view' THEN properties.session_id END) as stage_1,
    COUNT(DISTINCT CASE WHEN event = 'opened_contact_form' THEN properties.session_id END) as stage_2,
    COUNT(DISTINCT CASE WHEN event = 'contact_form_started' THEN properties.session_id END) as stage_3,
    COUNT(DISTINCT CASE WHEN event = 'contact_form_submit' THEN properties.session_id END) as stage_4,
    COUNT(DISTINCT CASE WHEN event = 'conversion_contact_form' THEN properties.session_id END) as stage_5
  FROM events
  WHERE timestamp >= now() - INTERVAL 30 DAY
)
SELECT
  stage_1 as "Visualizaram Imóvel",
  stage_2 as "Abriram Formulário",
  ROUND((stage_2 * 100.0 / stage_1), 2) as "% Abriram Form",
  stage_3 as "Começaram a Preencher",
  ROUND((stage_3 * 100.0 / stage_2), 2) as "% Começaram",
  stage_4 as "Enviaram Formulário",
  ROUND((stage_4 * 100.0 / stage_3), 2) as "% Completaram",
  stage_5 as "Conversões",
  ROUND((stage_5 * 100.0 / stage_1), 2) as "Conversão Total %"
FROM funnel
```

**Resultado exemplo:**
```
Visualizaram Imóvel: 1000
Abriram Formulário: 450 (45%)
Começaram a Preencher: 380 (84.4%)
Enviaram Formulário: 250 (65.8%)
Conversões: 250
Conversão Total: 25%
```

---

### **2. Taxa de Abandono do Formulário**

```sql
SELECT
  COUNT(CASE WHEN event = 'contact_form_started' THEN 1 END) as form_starts,
  COUNT(CASE WHEN event = 'contact_form_submit' THEN 1 END) as form_submits,
  COUNT(CASE WHEN event = 'contact_form_abandoned' THEN 1 END) as form_abandons,
  ROUND((COUNT(CASE WHEN event = 'contact_form_abandoned' THEN 1 END) * 100.0 /
         COUNT(CASE WHEN event = 'contact_form_started' THEN 1 END)), 2) as abandonment_rate
FROM events
WHERE timestamp >= now() - INTERVAL 30 DAY
```

**Exemplo:**
```
Form Starts: 380
Form Submits: 250
Form Abandons: 130
Abandonment Rate: 34.2%
```

**Ação:** Se taxa > 40%, otimizar formulário (menos campos, melhor UX)

---

### **3. Taxa de Rejeição (Bounce Rate)**

```sql
SELECT
  COUNT(DISTINCT properties.session_id) as total_sessions,
  COUNT(DISTINCT CASE WHEN event = 'bounce_detected' THEN properties.session_id END) as bounced_sessions,
  ROUND((COUNT(DISTINCT CASE WHEN event = 'bounce_detected' THEN properties.session_id END) * 100.0 /
         COUNT(DISTINCT properties.session_id)), 2) as bounce_rate,
  AVG(CASE WHEN event = 'bounce_detected' THEN properties.time_on_page END) as avg_bounce_time
FROM events
WHERE timestamp >= now() - INTERVAL 30 DAY
```

**Exemplo:**
```
Total Sessions: 5000
Bounced Sessions: 1200
Bounce Rate: 24%
Avg Bounce Time: 7 seconds
```

**Benchmarks:**
- < 25% - Excelente ✅
- 25-40% - Normal
- 40-55% - Precisa melhorar ⚠️
- > 55% - Crítico ❌

---

### **4. Campos Mais/Menos Preenchidos**

```sql
SELECT
  properties.field,
  COUNT(*) as focus_count,
  COUNT(CASE WHEN event = 'contact_form_field_filled' THEN 1 END) as filled_count,
  ROUND((COUNT(CASE WHEN event = 'contact_form_field_filled' THEN 1 END) * 100.0 /
         COUNT(*)), 2) as completion_rate
FROM events
WHERE
  event IN ('contact_form_field_focus', 'contact_form_field_filled')
  AND timestamp >= now() - INTERVAL 30 DAY
GROUP BY properties.field
ORDER BY completion_rate DESC
```

**Exemplo:**
```
Campo       | Focus | Filled | Completion %
------------|-------|--------|-------------
nome        | 380   | 370    | 97.4% ✅
email       | 380   | 360    | 94.7% ✅
telefone    | 380   | 340    | 89.5% ⚠️
mensagem    | 250   | 180    | 72.0% ⚠️
```

**Insights:**
- "Mensagem" tem baixa completude → considerar tornar opcional
- "Telefone" perde ~10% → simplificar validação

---

### **5. Jornada Completa até Conversão**

```sql
SELECT
  properties.user_id,
  COUNT(DISTINCT properties.session_id) as sessions_count,
  AVG(properties.page_depth) as avg_pages_per_session,
  AVG(properties.time_on_site) as avg_time_before_conversion,
  MIN(timestamp) as first_visit,
  MAX(timestamp) as conversion_date,
  DATEDIFF('day', MIN(timestamp), MAX(timestamp)) as days_to_convert
FROM events
WHERE
  properties.user_id IN (
    SELECT DISTINCT properties.user_id
    FROM events
    WHERE event = 'conversion_contact_form'
      AND timestamp >= now() - INTERVAL 30 DAY
  )
GROUP BY properties.user_id
ORDER BY days_to_convert DESC
LIMIT 100
```

**Exemplo:**
```
User ID         | Sessions | Avg Pages | Avg Time | Days to Convert
----------------|----------|-----------|----------|----------------
user_abc123     | 3        | 6.5       | 420s     | 5 dias
user_def456     | 1        | 12.0      | 680s     | 0 dias (same day)
user_ghi789     | 7        | 4.2       | 240s     | 14 dias
```

**Insights:**
- Usuários convertem entre 0-14 dias
- Média de 3 sessões até conversão
- 6-7 páginas vistas por sessão

---

## 🎯 EXEMPLO DE JORNADA REAL

### **Usuário: user_abc123**

**Sessão 1 (Dia 1):**
```
1. session_start (landing: home)
2. search_submit (buscou: apartamento, 2 quartos, SP)
3. viewed_property (código: 2854)
4. property_page_view (código: 2854)
5. property_gallery_navigation (viu 3 fotos)
6. scroll_depth (50%)
7. page_exit (time: 120s)
```
**Resultado:** Não converteu, saiu após 2min

---

**Sessão 2 (Dia 3):**
```
1. session_start (landing: /imovel/2854 - voltou direto!)
2. property_page_view (código: 2854)
3. scroll_depth (75%)
4. property_favorite_toggle (favoritou)
5. cta_mais_informacoes_click (abriu form)
6. opened_contact_form
7. contact_form_started
8. contact_form_field_focus (nome)
9. contact_form_field_filled (nome)
10. contact_form_field_focus (email)
11. contact_form_field_filled (email)
12. contact_form_abandoned (fechou sem enviar!)
```
**Resultado:** Abandonou formulário no meio

---

**Sessão 3 (Dia 5):**
```
1. session_start (landing: email marketing?)
2. property_page_view (código: 2854)
3. cta_mais_informacoes_click
4. opened_contact_form
5. contact_form_started
6. contact_form_field_focus (nome)
7. contact_form_field_filled (nome)
8. contact_form_field_focus (email)
9. contact_form_field_filled (email)
10. contact_form_field_focus (telefone)
11. contact_form_field_filled (telefone)
12. contact_form_field_focus (mensagem)
13. contact_form_field_filled (mensagem)
14. contact_form_submit (completeness: 100%)
15. conversion_contact_form ✅
16. funnel_stage_reached (submitted_contact_form)
```
**Resultado:** CONVERSÃO! 🎉

---

**Análise da Jornada:**
- **3 sessões** ao longo de **5 dias**
- **Retornou 2 vezes** antes de converter
- **Favoritou** o imóvel na 2ª visita
- **Abandonou** formulário uma vez
- **Converteu** na 3ª tentativa

**Insights:**
- Usuários precisam de múltiplas visitas
- Favoritos indicam alta intenção
- Follow-up após abandono pode ajudar

---

## 📊 DASHBOARD - EXEMPLOS DE GRÁFICOS

### **1. Funil Visual**

```
┌─────────────────────────────────────┐
│ Visitantes: 5,000                   │ 100%
└─────────────────────────────────────┘
              ↓ 30%
┌─────────────────────────────────────┐
│ Buscas: 1,500                       │ 30%
└─────────────────────────────────────┘
              ↓ 40%
┌─────────────────────────────────────┐
│ Visualizaram Imóvel: 600            │ 12%
└─────────────────────────────────────┘
              ↓ 45%
┌─────────────────────────────────────┐
│ Abriram Formulário: 270             │ 5.4%
└─────────────────────────────────────┘
              ↓ 70%
┌─────────────────────────────────────┐
│ Começaram a Preencher: 189          │ 3.8%
└─────────────────────────────────────┘
              ↓ 75%
┌─────────────────────────────────────┐
│ Enviaram Formulário: 142            │ 2.8%
└─────────────────────────────────────┘
              ↓ 100%
┌─────────────────────────────────────┐
│ 🎯 CONVERSÕES: 142                  │ 2.8%
└─────────────────────────────────────┘
```

**Taxa de conversão geral: 2.8%** (142 de 5,000 visitantes)

---

### **2. Drop-off Points (Onde Perdem Usuários)**

```
Etapa                    | Drop-off
-------------------------|----------
Visitantes → Buscas      | 70% 🔴
Buscas → Ver Imóvel      | 60% 🔴
Ver Imóvel → Abrir Form  | 55% 🔴
Abrir Form → Preencher   | 30% ⚠️
Preencher → Enviar       | 25% ✅
```

**Ações recomendadas:**
- **70% não fazem busca**: Melhorar CTA na home
- **60% não clicam em imóvel**: Melhorar fotos/títulos
- **55% não abrem form**: Melhorar botão "Mais Info"
- **30% abandonam form**: Simplificar formulário

---

### **3. Campos do Formulário - Completude**

```
Campo      | Foco | Preenchido | Taxa
-----------|------|------------|------
Nome       | 380  | 370        | 97% ✅
Email      | 380  | 360        | 95% ✅
Telefone   | 380  | 340        | 89% ⚠️
Mensagem   | 250  | 180        | 72% 🔴
```

**Recomendações:**
- Telefone: Remover máscara complexa
- Mensagem: Tornar opcional ou sugerir texto padrão

---

## 🔄 COMPARAÇÃO: ANTES vs DEPOIS

| Métrica | Script Original | Script Enhanced |
|---------|----------------|-----------------|
| **Rastreamento de filtros** | ⚠️ Parcial | ✅ 100% completo |
| **Quartos/Suítes/Vagas** | ❌ Não | ✅ **SIM** |
| **User Journey** | ❌ Não | ✅ **Persistente** |
| **Session Tracking** | ❌ Não | ✅ **30min timeout** |
| **Formulário de Contato** | ❌ Não | ✅ **Completo** |
| **Campos individuais** | ❌ Não | ✅ **Focus + Filled** |
| **Abandono de form** | ❌ Não | ✅ **Detectado** |
| **Taxa de rejeição** | ❌ Não | ✅ **Calculada** |
| **CTAs (Proposta/Alugar)** | ❌ Não | ✅ **Rastreados** |
| **Galeria de fotos** | ❌ Não | ✅ **Navegação** |
| **Associação ao usuário** | ❌ Não | ✅ **user_id + session_id** |

---

## ✅ CHECKLIST DE CONVERSÕES

### **Conversões Rastreadas:**

- [x] ✅ Formulário de contato (submit)
- [x] ✅ WhatsApp (click)
- [x] ✅ Telefone (click)
- [x] ✅ Email (click)
- [x] ✅ Fazer Proposta (redirect)
- [x] ✅ Alugar Imóvel (redirect)

### **Contexto de Cada Conversão:**

```javascript
{
  codigo: "2854",           // ✅ Código do imóvel
  user_id: "user_123...",   // ✅ Usuário único
  session_id: "session_456...", // ✅ Sessão atual
  page_depth: 8,            // ✅ Páginas visitadas
  time_on_site: 540,        // ✅ Tempo até conversão
  returning_visitor: false  // ✅ Novo ou retornante
}
```

---

## 🚀 IMPLEMENTAÇÃO

### **1. Incluir o Script no Site**

```html
<!-- Na página do imóvel -->
<script src="https://seu-cdn.com/static/capture-filtros-enhanced.js"></script>
```

### **2. Verificar Funcionamento**

```javascript
// Console do navegador
MyAnalytics.debug = true

// Interagir com página:
// 1. Clicar "MAIS INFORMAÇÕES"
// 2. Preencher campos
// 3. Enviar formulário

// Ver eventos no console ✅
```

### **3. Verificar no PostHog**

1. Acessar PostHog
2. Ir em "Events"
3. Filtrar por:
   - `property_page_view`
   - `contact_form_submit`
   - `conversion_contact_form`

4. Ver propriedades:
   - `user_id` ✅
   - `session_id` ✅
   - `codigo` ✅
   - `form_completeness` ✅

---

## 📋 RESUMO EXECUTIVO

### **✅ TUDO IMPLEMENTADO:**

#### **Página do Imóvel:**
- [x] View da página
- [x] Botão "Fazer Proposta"
- [x] Botão "Alugar Este Imóvel"
- [x] Botão "Mais Informações"
- [x] Galeria de fotos (navegação)
- [x] Compartilhar
- [x] Favoritar

#### **Formulário de Contato:**
- [x] Abertura do modal
- [x] Início do preenchimento
- [x] Foco em cada campo (nome, email, telefone, mensagem)
- [x] Preenchimento de cada campo
- [x] Envio do formulário
- [x] Conversão principal
- [x] Abandono detectado

#### **Taxa de Rejeição:**
- [x] Hard bounce (1 página + <10s)
- [x] Quick exit (<30s + scroll <25%)
- [x] Associado ao user_id

#### **Associação ao Usuário:**
- [x] user_id persistente
- [x] session_id com timeout
- [x] Journey completo (páginas visitadas)
- [x] Contexto em todos eventos

---

## 🎉 CONCLUSÃO

### **✅ PERGUNTAS RESPONDIDAS:**

**1. "Formulário de contato está sendo capturado?"**
→ ✅ **SIM! Completamente:**
- Abertura do modal ✅
- Campos individuais (foco + preenchimento) ✅
- Envio do formulário ✅
- Conversão principal ✅
- Abandono ✅

**2. "Evento de conversão associado ao usuário?"**
→ ✅ **SIM! Com contexto completo:**
- `user_id` persistente ✅
- `session_id` ✅
- Journey pages ✅
- Page depth e time on site ✅

**3. "Taxa de rejeição e outras informações relevantes?"**
→ ✅ **SIM! Métricas completas:**
- Bounce rate (hard + quick) ✅
- Taxa de abandono do form ✅
- Taxa de conversão por etapa ✅
- Campos problemáticos ✅
- Jornada completa até conversão ✅

---

**Status:** 🟢 **IMPLEMENTAÇÃO COMPLETA**

**Cobertura:** 100% (Formulário + CTAs + Rejeição + Journey)

**Próximo passo:** Substituir script no site e começar a coletar dados! 🚀

