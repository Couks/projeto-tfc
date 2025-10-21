import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from './queryKeys';

export interface Site {
  id: string;
  name: string;
  siteKey: string;
  status: string;
  createdAt: string;
  domains: Array<{
    id: string;
    host: string;
    isPrimary: boolean;
  }>;
}

// Query para listar sites
export function useSites() {
  return useQuery<Site[]>({
    queryKey: queryKeys.sites.all,
    queryFn: async () => {
      const res = await fetch('/api/sites');
      if (!res.ok) throw new Error('Failed to fetch sites');
      return res.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Query para site específico
export function useSite(siteId: string) {
  return useQuery<Site>({
    queryKey: queryKeys.sites.detail(siteId),
    queryFn: async () => {
      const res = await fetch(`/api/sites/${siteId}`);
      if (!res.ok) throw new Error('Failed to fetch site');
      return res.json();
    },
    enabled: !!siteId,
  });
}

// Mutation para criar site
export function useCreateSite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { name: string; domain: string }) => {
      const res = await fetch('/api/sites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create site');
      return res.json();
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
    mutationFn: async ({ siteId, data }: { siteId: string; data: Partial<Site> }) => {
      const res = await fetch(`/api/sites/${siteId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update site');
      return res.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sites.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.sites.detail(variables.siteId) });
    },
  });
}

// Mutation para deletar site
export function useDeleteSite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (siteId: string) => {
      const res = await fetch(`/api/sites/${siteId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete site');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sites.all });
    },
  });
}
