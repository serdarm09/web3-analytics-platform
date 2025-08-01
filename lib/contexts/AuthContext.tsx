'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { TokenManager } from '@/lib/utils/tokenManager'

interface AuthState {
  isAuthenticated: boolean
  user: any | null
  isLoading: boolean
  token: string | null
}

interface AuthContextType extends AuthState {
  login: (token: string, user: any, rememberMe?: boolean) => void
  logout: () => void
  register: (token: string, user: any, rememberMe?: boolean) => void
  checkAuth: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    isLoading: true,
    token: null
  })

  const router = useRouter()
  const pathname = usePathname()

  // Check authentication status on mount and route changes
  const checkAuth = async () => {
    try {
      console.log('🔍 checkAuth started')
      setAuthState(prev => ({ ...prev, isLoading: true }))
      
      // Get token using professional token manager
      const token = TokenManager.getToken()
      const cachedUser = TokenManager.getUser()
      
      console.log('🍪 Token status:', TokenManager.getStorageInfo())

      if (!token) {
        console.log('❌ No token found, setting unauthenticated state')
        setAuthState({
          isAuthenticated: false,
          user: null,
          isLoading: false,
          token: null
        })
        return
      }

      // If we have cached user data and token, use it immediately
      if (cachedUser && token) {
        console.log('⚡ Using cached user data for faster load')
        setAuthState({
          isAuthenticated: true,
          user: cachedUser,
          isLoading: false,
          token
        })
      }

      // Verify token with backend (still do this for security)
      console.log('🔐 Verifying token with backend')
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const userData = await response.json()
        console.log('✅ Token verified, user authenticated:', userData)
        
        const user = userData.user || userData
        
        // Update storage with fresh data
        TokenManager.setToken(token, user, true)
        
        setAuthState({
          isAuthenticated: true,
          user,
          isLoading: false,
          token
        })
      } else {
        const errorData = await response.text()
        console.log('❌ Token verification failed:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        })
        // Token is invalid, clear all storage
        TokenManager.clearToken()
        setAuthState({
          isAuthenticated: false,
          user: null,
          isLoading: false,
          token: null
        })
      }
    } catch (error) {
      console.error('Auth check error:', error)
      setAuthState({
        isAuthenticated: false,
        user: null,
        isLoading: false,
        token: null
      })
    }
  }

  const login = (token: string, user: any, rememberMe: boolean = true) => {
    console.log('🚀 Login function called with:', { 
      user: user?.email, 
      tokenLength: token?.length,
      rememberMe 
    })
    
    // Use professional token manager
    const success = TokenManager.setToken(token, user, rememberMe)
    
    if (success) {
      // Update state immediately
      setAuthState({
        isAuthenticated: true,
        user,
        isLoading: false,
        token
      })

      console.log('✅ Login state set successfully')
      console.log('📊 Storage status:', TokenManager.getStorageInfo())
      
      // Force redirect to dashboard after successful login
      const isAuthPage = pathname === '/login' || pathname === '/register'
      if (isAuthPage) {
        console.log('🔄 Redirecting to dashboard after login')
        router.push('/dashboard')
      }
    } else {
      console.error('❌ Failed to store token')
    }
  }

  const logout = async () => {
    console.log('🚪 Logout function called')
    
    // Clear client-side state immediately to update UI
    setAuthState({
      isAuthenticated: false,
      user: null,
      isLoading: false,
      token: null
    })
    
    // Clear all client-side storage first
    TokenManager.clearToken()
    
    // Aggressively clear cookies on client-side first
    try {
      // Clear with multiple variations to ensure compatibility
      const cookieVariations = [
        'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT',
        'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict',
        'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict; Secure',
        'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT',
        'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict',
        'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict; Secure'
      ]
      
      cookieVariations.forEach(cookieStr => {
        try {
          document.cookie = cookieStr
        } catch (e) {
          // Ignore individual failures
        }
      })
      
      console.log('🍪 Aggressively cleared cookies on client-side')
    } catch (error) {
      console.log('⚠️ Client-side cookie clearing failed:', error)  
    }
    
    try {
      // Call logout API to clear server-side cookies
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      })
      
      if (response.ok) {
        console.log('✅ Server-side logout successful')
      } else {
        console.warn('⚠️ Server-side logout failed, but proceeding with redirect')
      }
    } catch (error) {
      console.error('❌ Logout API error:', error)
      console.log('🔄 Proceeding with redirect anyway')
    }

    console.log('✅ Logout completed, forcing redirect')
    
    // Force a hard redirect that bypasses middleware caching
    window.location.href = '/login?_t=' + Date.now()
  }

  const register = (token: string, user: any, rememberMe: boolean = true) => {
    console.log('🚀 Register function called with:', { 
      user: user?.email, 
      tokenLength: token?.length,
      rememberMe 
    })
    
    // Use professional token manager
    const success = TokenManager.setToken(token, user, rememberMe)
    
    if (success) {
      setAuthState({
        isAuthenticated: true,
        user,
        isLoading: false,
        token
      })

      console.log('✅ Register state set successfully')
      console.log('📊 Storage status:', TokenManager.getStorageInfo())
    } else {
      console.error('❌ Failed to store token during registration')
    }
  }

  // Check auth on mount and when pathname changes
  useEffect(() => {
    console.log('🔄 AuthContext useEffect triggered - checking auth...')
    checkAuth()
  }, []) // Only run on mount, not on pathname changes

  // Handle redirects ONLY for auth pages, let individual layouts handle their own protection
  useEffect(() => {
    console.log('AuthContext redirect logic:', {
      isLoading: authState.isLoading,
      isAuthenticated: authState.isAuthenticated,
      pathname,
      user: authState.user?.email || 'no user'
    })

    if (authState.isLoading) return

    const isAuthRoute = ['/login', '/register'].includes(pathname)

    // Only handle redirects for auth pages when user is already authenticated
    if (authState.isAuthenticated && isAuthRoute) {
      console.log('🔄 Redirecting authenticated user from auth page to dashboard')
      router.replace('/dashboard')
    }
  }, [authState.isAuthenticated, authState.isLoading, pathname, router])

  const value: AuthContextType = {
    ...authState,
    login,
    logout,
    register,
    checkAuth
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
