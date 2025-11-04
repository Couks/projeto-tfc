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
  totalStarts: number;
  totalSubmits: number;
  totalAbandons: number;
  completionRate: number;
  abandonmentRate: number;
  avgCompletionTime: number;
  fieldAnalytics: Array<{
    field: string;
    focusCount: number;
    fillRate: number;
  }>;
  period: {
    start: string;
    end: string;
  };
}

export interface FormAbandonmentResponse {
  totalAbandons: number;
  abandonmentsByStage: Array<{
    stage: string;
    count: number;
    percentage: number;
  }>;
  commonlyAbandonedFields: Array<{
    field: string;
    abandonCount: number;
  }>;
  period: {
    start: string;
    end: string;
  };
}

// =====================
// ENGAGEMENT & PERFORMANCE
// =====================

export interface BounceAnalyticsResponse {
  totalBounces: number;
  bounceRate: number;
  bouncesByType: Array<{
    type: string;
    count: number;
    percentage: number;
  }>;
  topBouncePages: Array<{
    url: string;
    bounces: number;
    bounceRate: number;
  }>;
  period: {
    start: string;
    end: string;
  };
}

export interface ScrollAnalyticsResponse {
  avgScrollDepth: number;
  scrollDistribution: Array<{
    depth: number;
    count: number;
    percentage: number;
  }>;
  topEngagedPages: Array<{
    url: string;
    avgScrollDepth: number;
    deepScrolls: number;
  }>;
  period: {
    start: string;
    end: string;
  };
}
