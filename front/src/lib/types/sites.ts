/**
 * Type definitions for sites API responses
 */

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
