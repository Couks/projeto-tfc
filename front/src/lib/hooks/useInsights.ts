import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from './queryKeys'
import { apiClient } from '../api'
import type {
  OverviewResponse,
  TopEventsResponse,
  TopCitiesResponse,
  DevicesResponse,
  InsightsQuery,
} from '../types/insights'

export function useOverview(siteKey: string, query?: InsightsQuery) {
  const qs = new URLSearchParams({ site: siteKey })
  if (query?.dateFilter) qs.set('dateFilter', query.dateFilter)
  if (query?.startDate) qs.set('startDate', query.startDate)
  if (query?.endDate) qs.set('endDate', query.endDate)

  return useQuery<OverviewResponse>({
    queryKey: queryKeys.insights.overview(siteKey),
    queryFn: async () => {
      return apiClient.get<OverviewResponse>(
        `/api/insights/overview?${qs.toString()}`
      )
    },
    enabled: !!siteKey,
    staleTime: 2 * 60 * 1000, // 2 minutes (dados mais dinâmicos)
    refetchInterval: 5 * 60 * 1000, // Refetch a cada 5 minutos
  })
}

export function useTopEvents(siteKey: string, query?: InsightsQuery) {
  const qs = new URLSearchParams({ site: siteKey })
  if (query?.dateFilter) qs.set('dateFilter', query.dateFilter)
  if (query?.startDate) qs.set('startDate', query.startDate)
  if (query?.endDate) qs.set('endDate', query.endDate)
  if (query?.limit !== undefined) qs.set('limit', String(query.limit))
  if (query?.offset !== undefined) qs.set('offset', String(query.offset))

  return useQuery<TopEventsResponse>({
    queryKey: queryKeys.insights.conversions(siteKey),
    queryFn: async () => {
      return apiClient.get<TopEventsResponse>(
        `/api/insights/top-events?${qs.toString()}`
      )
    },
    enabled: !!siteKey,
    staleTime: 2 * 60 * 1000,
  })
}

export function useTopCities(siteKey: string, query?: InsightsQuery) {
  const qs = new URLSearchParams({ site: siteKey })
  if (query?.dateFilter) qs.set('dateFilter', query.dateFilter)
  if (query?.startDate) qs.set('startDate', query.startDate)
  if (query?.endDate) qs.set('endDate', query.endDate)
  if (query?.limit !== undefined) qs.set('limit', String(query.limit))
  if (query?.offset !== undefined) qs.set('offset', String(query.offset))

  return useQuery<TopCitiesResponse>({
    queryKey: queryKeys.insights.cities(siteKey),
    queryFn: async () => {
      return apiClient.get<TopCitiesResponse>(
        `/api/insights/cities?${qs.toString()}`
      )
    },
    enabled: !!siteKey,
    staleTime: 2 * 60 * 1000,
  })
}

export function useDevices(siteKey: string, query?: InsightsQuery) {
  const qs = new URLSearchParams({ site: siteKey })
  if (query?.dateFilter) qs.set('dateFilter', query.dateFilter)
  if (query?.startDate) qs.set('startDate', query.startDate)
  if (query?.endDate) qs.set('endDate', query.endDate)

  return useQuery<DevicesResponse>({
    queryKey: queryKeys.insights.types(siteKey),
    queryFn: async () => {
      return apiClient.get<DevicesResponse>(
        `/api/insights/devices?${qs.toString()}`
      )
    },
    enabled: !!siteKey,
    staleTime: 2 * 60 * 1000,
  })
}

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

// Hooks específicos para dados transformados
// legacy-derived hooks removed in favor of direct endpoints
