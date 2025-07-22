'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

interface User {
  id: string
  email: string
  username: string
  role: string
  subscriptionType: 'free' | 'pro' | 'enterprise'
  createdAt: string
}

interface LoginData {
  email: string
  password: string
}

interface RegisterData extends LoginData {
  username: string
  walletAddress?: string
  registrationMethod?: 'email' | 'wallet'
  name?: string
}

export function useAuth() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [isLoading, setIsLoading] = useState(true)

  const { data: user, error, refetch } = useQuery<User | null>({
    queryKey: ['user'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'include'
        })
        
        if (!response.ok) {
          if (response.status === 401) {
            return null
          }
          throw new Error('Failed to fetch user')
        }
        
        const data = await response.json()
        return data.user
      } catch (error) {
        console.error('Error fetching user:', error)
        return null
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: false
  })

  useEffect(() => {
    setIsLoading(false)
  }, [user, error])

  const loginMutation = useMutation({
    mutationFn: async (data: LoginData) => {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include'
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Login failed')
      }
      
      return response.json()
    },
    onSuccess: async () => {
      await refetch()
      router.push('/dashboard')
    }
  })

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterData) => {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include'
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Registration failed')
      }
      
      return response.json()
    },
    onSuccess: async () => {
      await refetch()
      router.push('/dashboard')
    }
  })

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      })
      
      if (!response.ok) {
        throw new Error('Logout failed')
      }
      
      return response.json()
    },
    onSuccess: () => {
      queryClient.setQueryData(['user'], null)
      queryClient.clear()
      router.push('/login')
    }
  })

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout: logoutMutation.mutate,
    loginError: loginMutation.error,
    registerError: registerMutation.error,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    isLoggingOut: logoutMutation.isPending
  }
}