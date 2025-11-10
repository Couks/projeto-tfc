export interface DevicesResponse {
  devices: Array<{
    deviceType: string;
    os: string;
    browser: string;
    count: number;
  }>;
}

export interface DevicesTimeSeriesResponse {
  data: Array<{
    date: string;
    mobile: number;
    desktop: number;
  }>;
  period: {
    start: string;
    end: string;
  };
}
