import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from './queryKeys'
import { apiClient } from '../api'
import type {
  InsightsQuery,
  SearchAnalyticsResponse,
  FiltersUsageResponse,
  ConversionRateResponse,
  ConversionSourcesResponse,
  PopularPropertiesResponse,
  PropertyEngagementResponse,
  PropertyCTAPerformanceResponse,
  FormPerformanceResponse,
  DevicesResponse,
} from '../types/insights'

export function useRefreshInsights() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: { fromDate: string; toDate: string }) => {
      return apiClient.post<{ success: boolean; message: string }>(
        `/api/insights/admin/refresh`,
        payload
      )
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.insights.all })
    },
  })
}

// =====================================================
// CATEGORIZED INSIGHTS HOOKS - NEW ENDPOINTS
// =====================================================

// ===== SEARCH & FILTERS =====

export function useSearchAnalytics(siteKey: string, query?: InsightsQuery) {
  return useQuery<SearchAnalyticsResponse>({
    queryKey: [
      ...queryKeys.insights.all,
      'search',
      'analytics',
      siteKey,
      query,
    ],
    queryFn: async () => {
      return apiClient.get<SearchAnalyticsResponse>(
        `/api/insights/search/analytics`,
        {
          siteKey,
        }
      )
    },
    enabled: !!siteKey,
    staleTime: 2 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  })
}

export function useFiltersUsage(siteKey: string, query?: InsightsQuery) {
  return useQuery<FiltersUsageResponse>({
    queryKey: [...queryKeys.insights.all, 'filters', 'usage', siteKey, query],
    queryFn: async () => {
      return apiClient.get<FiltersUsageResponse>(
        `/api/insights/filters/usage`,
        {
          siteKey,
        }
      )
    },
    enabled: !!siteKey,
    staleTime: 2 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  })
}

// ===== CONVERSION =====

export function useConversionRate(siteKey: string, query?: InsightsQuery) {
  return useQuery<ConversionRateResponse>({
    queryKey: [...queryKeys.insights.all, 'conversion', 'rate', siteKey, query],
    queryFn: async () => {
      return apiClient.get<ConversionRateResponse>(
        `/api/insights/conversion/rate`,
        {
          siteKey,
        }
      )
    },
    enabled: !!siteKey,
    staleTime: 2 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  })
}

export function useConversionSources(siteKey: string, query?: InsightsQuery) {
  return useQuery<ConversionSourcesResponse>({
    queryKey: [
      ...queryKeys.insights.all,
      'conversion',
      'sources',
      siteKey,
      query,
    ],
    queryFn: async () => {
      return apiClient.get<ConversionSourcesResponse>(
        `/api/insights/conversion/sources`,
        {
          siteKey,
        }
      )
    },
    enabled: !!siteKey,
    staleTime: 2 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  })
}

// ===== PROPERTIES =====

export function usePopularProperties(siteKey: string, query?: InsightsQuery) {
  return useQuery<PopularPropertiesResponse>({
    queryKey: [
      ...queryKeys.insights.all,
      'properties',
      'popular',
      siteKey,
      query,
    ],
    queryFn: async () => {
      return apiClient.get<PopularPropertiesResponse>(
        `/api/insights/properties/popular`,
        {
          siteKey,
        }
      )
    },
    enabled: !!siteKey,
    staleTime: 2 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  })
}

export function usePropertyEngagement(siteKey: string, query?: InsightsQuery) {
  return useQuery<PropertyEngagementResponse>({
    queryKey: [
      ...queryKeys.insights.all,
      'properties',
      'engagement',
      siteKey,
      query,
    ],
    queryFn: async () => {
      return apiClient.get<PropertyEngagementResponse>(
        `/api/insights/properties/engagement`,
        {
          siteKey,
        }
      )
    },
    enabled: !!siteKey,
    staleTime: 2 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  })
}

export function useCTAPerformance(siteKey: string, query?: InsightsQuery) {
  return useQuery<PropertyCTAPerformanceResponse>({
    queryKey: [...queryKeys.insights.all, 'properties', 'cta', siteKey, query],
    queryFn: async () => {
      return apiClient.get<PropertyCTAPerformanceResponse>(
        `/api/insights/properties/cta-performance`,
        {
          siteKey,
        }
      )
    },
    enabled: !!siteKey,
    staleTime: 2 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  })
}

// ===== FORMS =====

export function useFormPerformance(siteKey: string, query?: InsightsQuery) {
  return useQuery<FormPerformanceResponse>({
    queryKey: [
      ...queryKeys.insights.all,
      'forms',
      'performance',
      siteKey,
      query,
    ],
    queryFn: async () => {
      return apiClient.get<FormPerformanceResponse>(
        `/api/insights/forms/performance`,
        {
          siteKey,
        }
      )
    },
    enabled: !!siteKey,
    staleTime: 2 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  })
}

// ===== DEVICES =====

export function useDevices(siteKey: string, query?: InsightsQuery) {
  return useQuery<DevicesResponse>({
    queryKey: queryKeys.insights.devices(siteKey, query),
    queryFn: async () => {
      return apiClient.get<DevicesResponse>(`/api/insights/devices`, {
        siteKey,
        ...query,
      })
    },
    enabled: !!siteKey,
    staleTime: 2 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  })
}

