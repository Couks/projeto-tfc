import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from './queryKeys';
import { apiClient } from '../api';
import { Site } from "../types";

// Query para listar sites
export function useSites() {
  return useQuery<Site[]>({
    queryKey: queryKeys.sites.all,
    queryFn: async () => {
      return apiClient.get<Site[]>('/api/sites');
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Query para site específico
export function useSite(siteId: string) {
  return useQuery<Site>({
    queryKey: queryKeys.sites.detail(siteId),
    queryFn: async () => {
      return apiClient.get<Site>(`/api/sites/${siteId}`);
    },
    enabled: !!siteId,
  });
}

// Mutation para criar site
export function useCreateSite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { name: string; domain: string }) => {
      return apiClient.post('/api/sites', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sites.all });
    },
  });
}

// Mutation para atualizar site
export function useUpdateSite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      siteId,
      data,
    }: {
      siteId: string;
      data: Partial<Site>;
    }) => {
      return apiClient.put(`/api/sites/${siteId}`, data);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sites.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.sites.detail(variables.siteId),
      });
    },
  });
}

// Mutation para deletar site
export function useDeleteSite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (siteId: string) => {
      return apiClient.delete(`/api/sites/${siteId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sites.all });
    },
  });
}
