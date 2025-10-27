/**
 * Type definitions for insights API responses
 * Based on actual backend response structures from insights.service.ts
 */

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

export interface ConversionsData {
  conversions: Array<{
    type: string;
    count: number;
  }>;
  funnel: Array<{
    step: string;
    count: number;
  }>;
}

export interface JourneysData {
  pageDepth: Array<{
    depth: number;
    count: number;
  }>;
  scrollDepth: Array<{
    depth: number;
    count: number;
  }>;
  timeOnPage: Array<{
    range: string;
    count: number;
  }>;
  visitorType: Array<{
    type: string;
    count: number;
  }>;
}
