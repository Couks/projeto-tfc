/**
 * Type definitions for Insights API responses (materialized views)
 */

// Legacy type - kept for compatibility, but backend uses period in OverviewResponse
export interface InsightsDateRange {
  startDate: string // YYYY-MM-DD
  endDate: string // YYYY-MM-DD
}

// Matches backend response structure
export interface OverviewResponse {
  totalEvents: number
  totalSessions: number
  totalUsers: number
  avgTimeOnSite: number // seconds
  period: {
    start: string
    end: string
  }
}

export interface TopEventsResponseItem {
  name: string
  count: number
}

// Matches backend response structure
export interface TopEventsResponse {
  events: TopEventsResponseItem[]
}

export interface TopCityItem {
  city: string
  count: number
}

// Matches backend response structure
export interface TopCitiesResponse {
  cities: TopCityItem[]
}

export interface DeviceItem {
  deviceType: string
  os: string
  browser: string
  count: number
}

// Matches backend response structure
export interface DevicesResponse {
  devices: DeviceItem[]
}

export type DateFilter = 'DAY' | 'WEEK' | 'MONTH' | 'YEAR' | 'CUSTOM'

export interface InsightsQuery {
  dateFilter?: DateFilter
  startDate?: string // YYYY-MM-DD
  endDate?: string // YYYY-MM-DD
  limit?: number
  offset?: number
}
