'use client'

import { useState, useEffect } from 'react'

interface User {
  id: string
  email: string
  name?: string
  username?: string
  walletAddress?: string
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me')
        if (response.ok) {
          const data = await response.json()
          if (data.success && data.user) {
            setUser(data.user)
          } else {
            setUser(null)
          }
        } else {
          setUser(null)
        }
      } catch (error) {
        console.error('Error checking auth:', error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const logout = async () => {
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' })
      if (response.ok) {
        setUser(null)
        window.location.href = '/login'
      }
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  return {
    user,
    loading,
    isAuthenticated: !!user,
    logout
  }
}