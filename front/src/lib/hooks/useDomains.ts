import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../api'
import { queryKeys } from './queryKeys'

export interface Domain {
  id: string
  host: string
  isPrimary: boolean
  createdAt: string
}

export interface CreateDomainData {
  host: string
  isPrimary?: boolean
}

// Query para obter domínios de um site
export function useDomains(siteId: string) {
  return useQuery<Domain[]>({
    queryKey: queryKeys.domains.all(siteId),
    queryFn: async () => {
      return apiClient.get<Domain[]>(`/api/sites/${siteId}/domains`)
    },
    enabled: !!siteId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Mutation para adicionar domínio
export function useAddDomain() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      siteId,
      data,
    }: {
      siteId: string
      data: CreateDomainData
    }) => {
      return apiClient.post(`/api/sites/${siteId}/domains`, data)
    },
    onSuccess: (_, variables) => {
      // Invalidar cache dos domínios do site
      queryClient.invalidateQueries({
        queryKey: queryKeys.domains.all(variables.siteId),
      })
      // Também invalidar cache do site específico
      queryClient.invalidateQueries({
        queryKey: queryKeys.sites.detail(variables.siteId),
      })
    },
  })
}

// Mutation para remover domínio
export function useRemoveDomain() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      siteId,
      domainId,
    }: {
      siteId: string
      domainId: string
    }) => {
      return apiClient.delete(`/api/sites/${siteId}/domains/${domainId}`)
    },
    onSuccess: (_, variables) => {
      // Invalidar cache dos domínios do site
      queryClient.invalidateQueries({
        queryKey: queryKeys.domains.all(variables.siteId),
      })
      // Também invalidar cache do site específico
      queryClient.invalidateQueries({
        queryKey: queryKeys.sites.detail(variables.siteId),
      })
    },
  })
}
