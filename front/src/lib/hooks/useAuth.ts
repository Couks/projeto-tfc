import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api';

export interface User {
  id: string;
  name: string | null;
  email: string;
}

export function useUser() {
  return useQuery<User>({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      return apiClient.get<User>('/api/auth/me');
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: false, // Não retry em caso de 401
  });
}
