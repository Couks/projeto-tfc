export const queryKeys = {
  sites: {
    all: ['sites'] as const,
    detail: (id: string) => [...queryKeys.sites.all, id] as const,
  },
  domains: {
    all: (siteId: string) =>
      [...queryKeys.sites.detail(siteId), 'domains'] as const,
  },
  insights: {
    all: ['insights'] as const,
    // Categorized insights
    search: {
      analytics: (siteKey: string, query?: any) =>
        [
          ...queryKeys.insights.all,
          'search',
          'analytics',
          siteKey,
          query,
        ] as const,
      filters: (siteKey: string, query?: any) =>
        [
          ...queryKeys.insights.all,
          'filters',
          'usage',
          siteKey,
          query,
        ] as const,
    },
    conversion: {
      rate: (siteKey: string, query?: any) =>
        [
          ...queryKeys.insights.all,
          'conversion',
          'rate',
          siteKey,
          query,
        ] as const,
      funnel: (siteKey: string, query?: any) =>
        [
          ...queryKeys.insights.all,
          'conversion',
          'funnel',
          siteKey,
          query,
        ] as const,
      sources: (siteKey: string, query?: any) =>
        [
          ...queryKeys.insights.all,
          'conversion',
          'sources',
          siteKey,
          query,
        ] as const,
    },
    properties: {
      popular: (siteKey: string, query?: any) =>
        [
          ...queryKeys.insights.all,
          'properties',
          'popular',
          siteKey,
          query,
        ] as const,
      engagement: (siteKey: string, query?: any) =>
        [
          ...queryKeys.insights.all,
          'properties',
          'engagement',
          siteKey,
          query,
        ] as const,
      cta: (siteKey: string, query?: any) =>
        [
          ...queryKeys.insights.all,
          'properties',
          'cta',
          siteKey,
          query,
        ] as const,
    },
    forms: {
      performance: (siteKey: string, query?: any) =>
        [
          ...queryKeys.insights.all,
          'forms',
          'performance',
          siteKey,
          query,
        ] as const,
      abandonment: (siteKey: string, query?: any) =>
        [
          ...queryKeys.insights.all,
          'forms',
          'abandonment',
          siteKey,
          query,
        ] as const,
    },
    engagement: {
      bounce: (siteKey: string, query?: any) =>
        [
          ...queryKeys.insights.all,
          'engagement',
          'bounce',
          siteKey,
          query,
        ] as const,
      scroll: (siteKey: string, query?: any) =>
        [
          ...queryKeys.insights.all,
          'engagement',
          'scroll',
          siteKey,
          query,
        ] as const,
    },
  },
  auth: {
    all: ['auth'] as const,
    me: () => [...queryKeys.auth.all, 'me'] as const,
  },
} as const
