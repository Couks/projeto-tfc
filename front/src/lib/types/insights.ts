/**
 * Type definitions for Insights API responses (materialized views)
 */

export interface InsightsDateRange {
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
}

export interface OverviewResponse {
  eventsCount: number;
  sessionsCount: number;
  usersCount: number;
  avgTimeOnSite: number; // seconds
  dateRange: InsightsDateRange;
}

export interface TopEventsResponseItem {
  name: string;
  count: number;
}

export interface TopEventsResponse {
  topEvents: TopEventsResponseItem[];
  dateRange: InsightsDateRange;
}

export interface TopCityItem {
  city: string;
  count: number;
}

export interface TopCitiesResponse {
  topCities: TopCityItem[];
  dateRange: InsightsDateRange;
}

export interface DeviceItem {
  deviceType: string;
  os: string;
  browser: string;
  count: number;
}

export interface DevicesResponse {
  deviceDistribution: DeviceItem[];
  dateRange: InsightsDateRange;
}

export type DateFilter = 'DAY' | 'WEEK' | 'MONTH' | 'YEAR' | 'CUSTOM';

export interface InsightsQuery {
  dateFilter?: DateFilter;
  startDate?: string; // YYYY-MM-DD
  endDate?: string;   // YYYY-MM-DD
  limit?: number;
  offset?: number;
}
