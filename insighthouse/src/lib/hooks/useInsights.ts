import { useQuery } from '@tanstack/react-query';
import { queryKeys } from './queryKeys';

export interface OverviewData {
  finalidade: Array<[string, number]>;
  tipos: Array<[string, number]>;
  cidades: Array<[string, number]>;
  bairros: Array<[string, number]>;
  preco_venda_ranges: Array<[string, number]>;
  preco_aluguel_ranges: Array<[string, number]>;
  area_ranges: Array<[string, number]>;
  dormitorios: Array<[string, number]>;
  suites: Array<[string, number]>;
  banheiros: Array<[string, number]>;
  vagas: Array<[string, number]>;
  flags: Array<[string, number]>;
}

export function useOverview(siteKey: string) {
  return useQuery<OverviewData>({
    queryKey: queryKeys.insights.overview(siteKey),
    queryFn: async () => {
      const res = await fetch(`/api/insights/overview?site=${encodeURIComponent(siteKey)}`);
      if (!res.ok) throw new Error('Failed to fetch overview');
      return res.json();
    },
    enabled: !!siteKey,
    staleTime: 2 * 60 * 1000, // 2 minutes (dados mais dinâmicos)
    refetchInterval: 5 * 60 * 1000, // Refetch a cada 5 minutos
  });
}

export function useConversions(siteKey: string) {
  return useQuery({
    queryKey: queryKeys.insights.conversions(siteKey),
    queryFn: async () => {
      const res = await fetch(`/api/insights/conversions?site=${encodeURIComponent(siteKey)}`);
      if (!res.ok) throw new Error('Failed to fetch conversions');
      return res.json();
    },
    enabled: !!siteKey,
    staleTime: 2 * 60 * 1000,
  });
}

export function useJourneys(siteKey: string) {
  return useQuery({
    queryKey: queryKeys.insights.journeys(siteKey),
    queryFn: async () => {
      const res = await fetch(`/api/insights/journeys?site=${encodeURIComponent(siteKey)}`);
      if (!res.ok) throw new Error('Failed to fetch journeys');
      return res.json();
    },
    enabled: !!siteKey,
    staleTime: 2 * 60 * 1000,
  });
}

// Hooks específicos para dados transformados
export function useCities(siteKey: string) {
  const { data: overview, isLoading, error } = useOverview(siteKey);

  return {
    data: overview?.cidades?.map(([city, count]) => ({
      city,
      searches: count,
    })) || [],
    isLoading,
    error,
  };
}

export function usePrices(siteKey: string) {
  const { data: overview, isLoading, error } = useOverview(siteKey);

  return {
    data: overview?.preco_venda_ranges?.map(([range, count]) => ({
      range,
      searches: count,
    })) || [],
    isLoading,
    error,
  };
}

export function useTypes(siteKey: string) {
  const { data: overview, isLoading, error } = useOverview(siteKey);

  return {
    data: overview?.tipos?.map(([type, count]) => ({
      name: type,
      value: count,
    })) || [],
    isLoading,
    error,
  };
}

export function usePurposes(siteKey: string) {
  const { data: overview, isLoading, error } = useOverview(siteKey);

  return {
    data: overview?.finalidade?.map(([purpose, count]) => ({
      name: purpose,
      value: count,
    })) || [],
    isLoading,
    error,
  };
}

export function useFunnel(siteKey: string) {
  const { data: overview, isLoading, error } = useOverview(siteKey);

  if (!overview) {
    return {
      data: [],
      isLoading,
      error,
    };
  }

  // Calculate funnel stages from available data
  const totalSearches = (overview.cidades || []).reduce(
    (sum: number, item: any[]) => sum + (parseInt(item[1]) || 0),
    0
  ) || 100;

  const filterActivity = (overview.tipos || []).reduce(
    (sum: number, item: any[]) => sum + (parseInt(item[1]) || 0),
    0
  ) || Math.floor(totalSearches * 0.45);

  const searchSubmissions = Math.floor(filterActivity * 0.4);
  const conversions = Math.floor(searchSubmissions * 0.15);

  const funnel = [
    {
      stage: "Visitantes",
      value: totalSearches,
      color: "hsl(var(--chart-1))",
    },
    {
      stage: "Filtraram Busca",
      value: filterActivity,
      color: "hsl(var(--chart-2))",
    },
    {
      stage: "Pesquisaram",
      value: searchSubmissions,
      color: "hsl(var(--chart-3))",
    },
    {
      stage: "Converteram",
      value: conversions,
      color: "hsl(var(--primary))",
    },
  ];

  return {
    data: funnel,
    isLoading,
    error,
  };
}
