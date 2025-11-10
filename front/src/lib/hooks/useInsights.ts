import { useQuery } from '@tanstack/react-query'
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
  DevicesResponse,
  DevicesTimeSeriesResponse,
  LeadProfileResponse,
  PropertyFunnelResponse,
  TopConvertingFiltersResponse,
} from '../types/insights'

// =====================================================
// OVERVIEW INSIGHTS
// =====================================================

export function useDevices(siteKey: string, query?: InsightsQuery) {
  return useQuery<DevicesResponse>({
    queryKey: queryKeys.insights.overview.devices(siteKey, query),
    queryFn: () =>
      apiClient.get<DevicesResponse>(`/api/insights/overview/devices`, {
        siteKey,
        ...query,
      }),
    enabled: !!siteKey,
  })
}

export function useDevicesTimeSeries(siteKey: string, query?: InsightsQuery) {
  return useQuery<DevicesTimeSeriesResponse>({
    queryKey: queryKeys.insights.overview.devicesTimeSeries(siteKey, query),
    queryFn: () =>
      apiClient.get<DevicesTimeSeriesResponse>(
        `/api/insights/overview/devices/timeseries`,
        {
          siteKey,
          ...query,
        }
      ),
    enabled: !!siteKey,
  })
}

// =====================================================
// SEARCH INSIGHTS
// =====================================================

export function useSearchSummary(siteKey: string, query?: InsightsQuery) {
  return useQuery<SearchAnalyticsResponse>({
    queryKey: queryKeys.insights.search.summary(siteKey, query),
    queryFn: () =>
      apiClient.get<SearchAnalyticsResponse>(`/api/insights/search/summary`, {
        siteKey,
        ...query,
      }),
    enabled: !!siteKey,
  })
}

export function useFiltersUsage(siteKey: string, query?: InsightsQuery) {
  return useQuery<FiltersUsageResponse>({
    queryKey: queryKeys.insights.search.filtersUsage(siteKey, query),
    queryFn: () =>
      apiClient.get<FiltersUsageResponse>(
        `/api/insights/search/filters-usage`,
        {
          siteKey,
          ...query,
        }
      ),
    enabled: !!siteKey,
  })
}

export function useTopConvertingFilters(
  siteKey: string,
  query?: InsightsQuery
) {
  return useQuery<TopConvertingFiltersResponse>({
    queryKey: queryKeys.insights.search.topConvertingFilters(siteKey, query),
    queryFn: () =>
      apiClient.get<TopConvertingFiltersResponse>(
        `/api/insights/search/top-converting-filters`,
        {
          siteKey,
          ...query,
        }
      ),
    enabled: !!siteKey,
  })
}

// =====================================================
// PROPERTY INSIGHTS
// =====================================================

export function usePopularProperties(siteKey: string, query?: InsightsQuery) {
  return useQuery<PopularPropertiesResponse>({
    queryKey: queryKeys.insights.property.popular(siteKey, query),
    queryFn: () =>
      apiClient.get<PopularPropertiesResponse>(
        `/api/insights/properties/popular`,
        {
          siteKey,
          ...query,
        }
      ),
    enabled: !!siteKey,
  })
}

export function usePropertyEngagement(siteKey: string, query?: InsightsQuery) {
  return useQuery<PropertyEngagementResponse>({
    queryKey: queryKeys.insights.property.engagement(siteKey, query),
    queryFn: () =>
      apiClient.get<PropertyEngagementResponse>(
        `/api/insights/properties/engagement`,
        {
          siteKey,
          ...query,
        }
      ),
    enabled: !!siteKey,
  })
}

export function usePropertyFunnel(
  siteKey: string,
  propertyCode: string,
  query?: InsightsQuery
) {
  return useQuery<PropertyFunnelResponse>({
    queryKey: queryKeys.insights.property.funnel(siteKey, propertyCode, query),
    queryFn: () =>
      apiClient.get<PropertyFunnelResponse>(
        `/api/insights/properties/${propertyCode}/funnel`,
        {
          siteKey,
          ...query,
        }
      ),
    enabled: !!siteKey && !!propertyCode,
  })
}

// =====================================================
// CONVERSION INSIGHTS
// =====================================================

export function useConversionSummary(siteKey: string, query?: InsightsQuery) {
  return useQuery<ConversionRateResponse>({
    queryKey: queryKeys.insights.conversion.summary(siteKey, query),
    queryFn: () =>
      apiClient.get<ConversionRateResponse>(
        `/api/insights/conversion/summary`,
        {
          siteKey,
          ...query,
        }
      ),
    enabled: !!siteKey,
  })
}

export function useConversionSources(siteKey: string, query?: InsightsQuery) {
  return useQuery<ConversionSourcesResponse>({
    queryKey: queryKeys.insights.conversion.sources(siteKey, query),
    queryFn: () =>
      apiClient.get<ConversionSourcesResponse>(
        `/api/insights/conversion/sources`,
        {
          siteKey,
          ...query,
        }
      ),
    enabled: !!siteKey,
  })
}

export function useLeadProfile(siteKey: string, query?: InsightsQuery) {
  return useQuery<LeadProfileResponse>({
    queryKey: queryKeys.insights.conversion.leadProfile(siteKey, query),
    queryFn: () =>
      apiClient.get<LeadProfileResponse>(
        `/api/insights/conversion/lead-profile`,
        {
          siteKey,
          ...query,
        }
      ),
    enabled: !!siteKey,
  })
}
