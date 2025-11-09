/**
 * Response interfaces for categorized insights endpoints
 */

// =====================
// SEARCH & FILTERS
// =====================

export interface SearchAnalyticsResponse {
  totalSearches: number;
  topFinalidades: Array<{
    finalidade: string;
    count: number;
  }>;
  topTipos: Array<{
    tipo: string;
    count: number;
  }>;
  topCidades: Array<{
    cidade: string;
    count: number;
  }>;
  topBairros: Array<{
    bairro: string;
    count: number;
  }>;
  topQuartos: Array<{
    quartos: string;
    count: number;
  }>;
  topSuites: Array<{
    suites: string;
    count: number;
  }>;
  topBanheiros: Array<{
    banheiros: string;
    count: number;
  }>;
  topVagas: Array<{
    vagas: string;
    count: number;
  }>;
  topSalas: Array<{
    salas: string;
    count: number;
  }>;
  topGalpoes: Array<{
    galpoes: string;
    count: number;
  }>;
  topComodos: Array<{
    comodo: string;
    count: number;
  }>;
  priceRanges: {
    venda: Array<{
      range: string;
      count: number;
    }>;
    aluguel: Array<{
      range: string;
      count: number;
    }>;
  };
  areaRanges: Array<{
    range: string;
    count: number;
  }>;
  topSwitches: Array<{
    switch: string;
    count: number;
    percentage: number;
  }>;
  topComodidades: Array<{
    comodidade: string;
    count: number;
  }>;
  topLazer: Array<{
    lazer: string;
    count: number;
  }>;
  topSeguranca: Array<{
    seguranca: string;
    count: number;
  }>;
  avgFiltersUsed: number;
  period: {
    start: string;
    end: string;
  };
}

export interface FiltersUsageResponse {
  totalFilterChanges: number;
  filtersByType: Array<{
    filterType: string;
    count: number;
    percentage: number;
  }>;
  topFilterCombinations: Array<{
    combination: string[];
    count: number;
  }>;
  period: {
    start: string;
    end: string;
  };
}

// =====================
// CONVERSION
// =====================

export interface ConversionRateResponse {
  totalConversions: number;
  totalSessions: number;
  conversionRate: number;
  conversionsByType: Array<{
    type: string;
    count: number;
    percentage: number;
  }>;
  period: {
    start: string;
    end: string;
  };
}

export interface ConversionFunnelResponse {
  stages: Array<{
    stage: string;
    count: number;
    percentage: number;
    dropoffRate: number;
  }>;
  totalStarted: number;
  totalCompleted: number;
  overallConversionRate: number;
  period: {
    start: string;
    end: string;
  };
}

export interface ConversionSourcesResponse {
  sources: Array<{
    source: string;
    conversions: number;
    percentage: number;
  }>;
  period: {
    start: string;
    end: string;
  };
}

// =====================
// PROPERTIES
// =====================

export interface PopularPropertiesResponse {
  properties: Array<{
    codigo: string;
    views: number;
    favorites: number;
    ctaClicks: number;
    engagementScore: number;
  }>;
  period: {
    start: string;
    end: string;
  };
}

export interface PropertyEngagementResponse {
  totalViews: number;
  totalFavorites: number;
  totalShares: number;
  avgTimeOnProperty: number;
  ctaPerformance: {
    fazerProposta: number;
    alugarImovel: number;
    maisInformacoes: number;
  };
  period: {
    start: string;
    end: string;
  };
}

export interface PropertyCTAPerformanceResponse {
  ctas: Array<{
    ctaType: string;
    clicks: number;
    conversionRate: number;
  }>;
  period: {
    start: string;
    end: string;
  };
}

// =====================
// FORMS
// =====================

export interface FormPerformanceResponse {
  totalSubmits: number;
  completionRate: number;
  period: {
    start: string;
    end: string;
  };
}
