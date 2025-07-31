'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/lib/contexts/AuthContext'

interface UserProfile {
  id: string
  email: string
  username: string
  role: string
  subscriptionType: 'free' | 'pro' | 'enterprise'
  avatar?: string
  bio?: string
  settings?: {
    notifications: boolean
    emailAlerts: boolean
    theme: 'light' | 'dark'
    language: string
  }
  createdAt: string
  updatedAt: string
}

interface UpdateProfileData {
  username?: string
  bio?: string
  avatar?: string
  settings?: UserProfile['settings']
}

export function useUser() {
  const { user, isAuthenticated } = useAuth()
  const queryClient = useQueryClient()

  const { data: profile, isLoading } = useQuery<UserProfile>({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('No user ID')
      
      const response = await fetch(`/api/users/${user.id}`, {
        credentials: 'include'
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch user profile')
      }
      
      return response.json()
    },
    enabled: isAuthenticated && !!user?.id,
    staleTime: 10 * 60 * 1000
  })

  const updateProfileMutation = useMutation({
    mutationFn: async (data: UpdateProfileData) => {
      if (!user?.id) throw new Error('No user ID')
      
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include'
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update profile')
      }
      
      return response.json()
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['user-profile', user?.id], data)
      queryClient.invalidateQueries({ queryKey: ['user'] })
    }
  })

  const deleteAccountMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('No user ID')
      
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'DELETE',
        credentials: 'include'
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete account')
      }
      
      return response.json()
    },
    onSuccess: () => {
      queryClient.clear()
      window.location.href = '/'
    }
  })

  return {
    profile: profile || user,
    isLoading,
    updateProfile: updateProfileMutation.mutate,
    deleteAccount: deleteAccountMutation.mutate,
    isUpdating: updateProfileMutation.isPending,
    isDeleting: deleteAccountMutation.isPending,
    updateError: updateProfileMutation.error,
    deleteError: deleteAccountMutation.error
  }
}