import { useQuery } from '@tanstack/react-query';

export interface User {
  id: string;
  name: string | null;
  email: string;
}

export function useUser() {
  return useQuery<User>({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const res = await fetch('/api/auth/me');
      if (!res.ok) throw new Error('Failed to fetch user');
      return res.json();
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: false, // Não retry em caso de 401
  });
}
