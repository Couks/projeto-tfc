# Categorized Insights API

This document describes the organized insights endpoints that provide analytics by category.

## Overview

The insights system is organized into 5 main categories:
- **Search & Filters**: Analytics about searches and filter usage
- **Conversion**: Conversion rates, funnels, and sources
- **Property**: Property views, engagement, and CTA performance
- **Forms**: Form completion and abandonment analytics
- **Engagement**: Bounce and scroll analytics

All endpoints require the `X-Site-Key` header for authentication.

## Common Query Parameters

All endpoints support the following query parameters:

| Parameter | Type | Values | Default | Description |
|-----------|------|--------|---------|-------------|
| `dateFilter` | enum | `day`, `week`, `month`, `year`, `custom` | Last 30 days | Date range filter |
| `startDate` | ISO 8601 | Date string | - | Custom start date (requires `dateFilter=custom`) |
| `endDate` | ISO 8601 | Date string | - | Custom end date (requires `dateFilter=custom`) |
| `limit` | number | 1-100 | 10 | Number of results to return |

## Endpoints by Category

### Search & Filters

#### GET `/api/insights/search/analytics`

Returns comprehensive search analytics including total searches, top finalidades, tipos, and cidades.

**Response:**
```json
{
  "totalSearches": 1234,
  "topFinalidades": [
    { "finalidade": "venda", "count": 800 },
    { "finalidade": "aluguel", "count": 434 }
  ],
  "topTipos": [
    { "tipo": "apartamento", "count": 600 },
    { "tipo": "casa", "count": 400 }
  ],
  "topCidades": [
    { "cidade": "São Paulo", "count": 500 },
    { "cidade": "Rio de Janeiro", "count": 300 }
  ],
  "avgFiltersUsed": 3,
  "period": {
    "start": "2024-01-01T00:00:00Z",
    "end": "2024-01-31T23:59:59Z"
  }
}
```

#### GET `/api/insights/filters/usage`

Returns filter usage analytics showing which filters are most used.

**Response:**
```json
{
  "totalFilterChanges": 5000,
  "filtersByType": [
    { "filterType": "finalidade", "count": 1200, "percentage": 24.0 },
    { "filterType": "cidade", "count": 1000, "percentage": 20.0 }
  ],
  "topFilterCombinations": [],
  "period": {
    "start": "2024-01-01T00:00:00Z",
    "end": "2024-01-31T23:59:59Z"
  }
}
```

### Conversion

#### GET `/api/insights/conversion/rate`

Returns conversion rate analytics by type.

**Response:**
```json
{
  "totalConversions": 150,
  "totalSessions": 5000,
  "conversionRate": 3.0,
  "conversionsByType": [
    { "type": "conversion_contact_form", "count": 80, "percentage": 53.33 },
    { "type": "conversion_whatsapp_click", "count": 50, "percentage": 33.33 }
  ],
  "period": {
    "start": "2024-01-01T00:00:00Z",
    "end": "2024-01-31T23:59:59Z"
  }
}
```

#### GET `/api/insights/conversion/funnel`

Returns conversion funnel stages with dropoff rates.

**Response:**
```json
{
  "stages": [
    {
      "stage": "search_submitted",
      "count": 1000,
      "percentage": 100.0,
      "dropoffRate": 0
    },
    {
      "stage": "viewed_property",
      "count": 500,
      "percentage": 50.0,
      "dropoffRate": 50.0
    },
    {
      "stage": "conversion_confirmed",
      "count": 150,
      "percentage": 15.0,
      "dropoffRate": 70.0
    }
  ],
  "totalStarted": 1000,
  "totalCompleted": 150,
  "overallConversionRate": 15.0,
  "period": {
    "start": "2024-01-01T00:00:00Z",
    "end": "2024-01-31T23:59:59Z"
  }
}
```

#### GET `/api/insights/conversion/sources`

Returns conversion sources analytics.

**Response:**
```json
{
  "sources": [
    { "source": "search", "conversions": 100, "percentage": 66.67 },
    { "source": "direct", "conversions": 50, "percentage": 33.33 }
  ],
  "period": {
    "start": "2024-01-01T00:00:00Z",
    "end": "2024-01-31T23:59:59Z"
  }
}
```

### Property

#### GET `/api/insights/properties/popular`

Returns most popular properties by views, favorites, and CTA clicks.

**Response:**
```json
{
  "properties": [
    {
      "codigo": "12345",
      "views": 500,
      "favorites": 50,
      "ctaClicks": 30,
      "engagementScore": 800
    }
  ],
  "period": {
    "start": "2024-01-01T00:00:00Z",
    "end": "2024-01-31T23:59:59Z"
  }
}
```

#### GET `/api/insights/properties/engagement`

Returns overall property engagement metrics.

**Response:**
```json
{
  "totalViews": 5000,
  "totalFavorites": 500,
  "totalShares": 100,
  "avgTimeOnProperty": 120,
  "ctaPerformance": {
    "fazerProposta": 200,
    "alugarImovel": 150,
    "maisInformacoes": 300
  },
  "period": {
    "start": "2024-01-01T00:00:00Z",
    "end": "2024-01-31T23:59:59Z"
  }
}
```

#### GET `/api/insights/properties/cta-performance`

Returns CTA performance with conversion rates.

**Response:**
```json
{
  "ctas": [
    { "ctaType": "fazer_proposta", "clicks": 200, "conversionRate": 4.0 },
    { "ctaType": "alugar_imovel", "clicks": 150, "conversionRate": 3.0 },
    { "ctaType": "mais_informacoes", "clicks": 300, "conversionRate": 6.0 }
  ],
  "period": {
    "start": "2024-01-01T00:00:00Z",
    "end": "2024-01-31T23:59:59Z"
  }
}
```

### Forms

#### GET `/api/insights/forms/performance`

Returns form performance metrics including completion and abandonment rates.

**Response:**
```json
{
  "totalStarts": 1000,
  "totalSubmits": 400,
  "totalAbandons": 600,
  "completionRate": 40.0,
  "abandonmentRate": 60.0,
  "avgCompletionTime": 120,
  "fieldAnalytics": [
    { "field": "nome", "focusCount": 1000, "fillRate": 95.0 },
    { "field": "email", "focusCount": 950, "fillRate": 90.0 },
    { "field": "telefone", "focusCount": 900, "fillRate": 85.0 }
  ],
  "period": {
    "start": "2024-01-01T00:00:00Z",
    "end": "2024-01-31T23:59:59Z"
  }
}
```

#### GET `/api/insights/forms/abandonment`

Returns form abandonment analytics.

**Response:**
```json
{
  "totalAbandons": 600,
  "abandonmentsByStage": [],
  "commonlyAbandonedFields": [
    { "field": "mensagem", "abandonCount": 200 },
    { "field": "telefone", "abandonCount": 150 }
  ],
  "period": {
    "start": "2024-01-01T00:00:00Z",
    "end": "2024-01-31T23:59:59Z"
  }
}
```

### Engagement & Performance

#### GET `/api/insights/bounce/analytics`

Returns bounce analytics including bounce rate and types.

**Response:**
```json
{
  "totalBounces": 500,
  "bounceRate": 10.0,
  "bouncesByType": [
    { "type": "hard_bounce", "count": 300, "percentage": 60.0 },
    { "type": "quick_exit", "count": 200, "percentage": 40.0 }
  ],
  "topBouncePages": [
    { "url": "https://example.com/page1", "bounces": 100, "bounceRate": 20.0 }
  ],
  "period": {
    "start": "2024-01-01T00:00:00Z",
    "end": "2024-01-31T23:59:59Z"
  }
}
```

#### GET `/api/insights/scroll/analytics`

Returns scroll depth analytics.

**Response:**
```json
{
  "avgScrollDepth": 65,
  "scrollDistribution": [
    { "depth": 25, "count": 1000, "percentage": 30.0 },
    { "depth": 50, "count": 800, "percentage": 24.0 },
    { "depth": 75, "count": 600, "percentage": 18.0 },
    { "depth": 100, "count": 400, "percentage": 12.0 }
  ],
  "topEngagedPages": [
    { "url": "https://example.com/page1", "avgScrollDepth": 85, "deepScrolls": 300 }
  ],
  "period": {
    "start": "2024-01-01T00:00:00Z",
    "end": "2024-01-31T23:59:59Z"
  }
}
```

## Data Refresh

All insights are based on materialized views that are refreshed periodically. To manually refresh:

```bash
POST /api/insights/admin/refresh
Content-Type: application/json
X-Site-Key: your-site-key

{
  "fromDate": "2024-01-01T00:00:00Z",
  "toDate": "2024-01-31T23:59:59Z"
}
```

## Event Categories

The system organizes events into the following categories:

| Category | Events |
|----------|--------|
| SEARCH | `search_submit` |
| FILTERS | `search_filter_changed`, `search_filter_group_changed`, `search_filter_range_changed`, `search_filter_toggle`, `advanced_filters_toggle`, etc. |
| NAVIGATION | `results_item_click`, `results_saber_mais_click`, `property_page_view`, `property_gallery_navigation` |
| ENGAGEMENT | `favorite_toggle`, `property_favorite_toggle`, `property_share_click`, `scroll_depth` |
| CONVERSION | `conversion_complete`, `conversion_contact_form`, `conversion_whatsapp_click`, `conversion_phone_click`, `conversion_email_click` |
| FUNNEL | `funnel_stage_reached` |
| PROPERTY | `cta_fazer_proposta_click`, `cta_alugar_imovel_click`, `cta_mais_informacoes_click` |
| FORM | `contact_form_started`, `contact_form_submit`, `contact_form_abandoned`, `contact_form_field_focus`, `contact_form_field_filled` |
| SESSION | `session_start` |
| PERFORMANCE | `page_exit`, `bounce_detected` |

## Implementation Notes

- All queries use materialized views for optimal performance
- Materialized views are updated periodically (recommend hourly/daily refresh)
- Date ranges default to last 30 days if not specified
- All responses include a `period` object with `start` and `end` dates
- Percentages are rounded to 2 decimal places
- Empty results return zeros instead of nulls for consistency

