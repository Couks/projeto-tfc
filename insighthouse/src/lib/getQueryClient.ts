import { QueryClient } from '@tanstack/react-query';
import { cache } from 'react';

// Create a singleton query client for server-side prefetching
// Using cache() ensures we get the same instance per request
export const getQueryClient = cache(() => new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    },
  },
}));
