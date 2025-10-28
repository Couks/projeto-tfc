export interface OverviewResponse {
  totalEvents: number;
  totalSessions: number;
  totalUsers: number;
  avgTimeOnSite: number;
  period: {
    start: string;
    end: string;
  };
}

export interface TopEventsResponse {
  events: Array<{
    name: string;
    count: number;
  }>;
}

export interface TopCitiesResponse {
  cities: Array<{
    city: string;
    count: number;
  }>;
}

export interface DevicesResponse {
  devices: Array<{
    deviceType: string;
    os: string;
    browser: string;
    count: number;
  }>;
}
