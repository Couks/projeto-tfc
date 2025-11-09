export interface DevicesResponse {
  devices: Array<{
    deviceType: string;
    os: string;
    browser: string;
    count: number;
  }>;
}
