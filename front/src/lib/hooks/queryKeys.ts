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
    overview: (siteKey: string) =>
      [...queryKeys.insights.all, 'overview', siteKey] as const,
    cities: (siteKey: string) =>
      [...queryKeys.insights.all, 'cities', siteKey] as const,
    types: (siteKey: string) =>
      [...queryKeys.insights.all, 'types', siteKey] as const,
    // Unused keys - endpoints not available in backend yet
    // prices: (siteKey: string) =>
    //   [...queryKeys.insights.all, 'prices', siteKey] as const,
    // purposes: (siteKey: string) =>
    //   [...queryKeys.insights.all, 'purposes', siteKey] as const,
    // funnel: (siteKey: string) =>
    //   [...queryKeys.insights.all, 'funnel', siteKey] as const,
    // conversions: (siteKey: string) =>
    //   [...queryKeys.insights.all, 'conversions', siteKey] as const,
    // journeys: (siteKey: string) =>
    //   [...queryKeys.insights.all, 'journeys', siteKey] as const,
  },
  auth: {
    all: ['auth'] as const,
    me: () => [...queryKeys.auth.all, 'me'] as const,
  },
} as const
