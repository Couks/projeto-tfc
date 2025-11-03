import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../api'
import { queryKeys } from './queryKeys'

export interface User {
  id: string
  name: string | null
  email: string
  createdAt: string
}

export interface LoginData {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  name: string
}

// Query para obter dados do usuário atual
export function useUser() {
  return useQuery<User>({
    queryKey: queryKeys.auth.me(),
    queryFn: async () => {
      return apiClient.get<User>('/api/auth/me')
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: false, // Não retry em caso de 401
  })
}

// Mutation para login
export function useLogin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: LoginData) => {
      return apiClient.post('/api/auth/login', data)
    },
    onSuccess: () => {
      // Invalidar cache do usuário para refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me() })
    },
  })
}

// Mutation para registro
export function useRegister() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: RegisterData) => {
      return apiClient.post('/api/auth/register', data)
    },
    onSuccess: () => {
      // Invalidar cache do usuário para refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me() })
    },
  })
}

// Mutation para logout
export function useLogout() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      return apiClient.post('/api/auth/logout')
    },
    onSuccess: () => {
      // Limpar todo o cache do usuário
      queryClient.clear()
    },
  })
}
