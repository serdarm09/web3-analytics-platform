// Professional token management utility
export class TokenManager {
  private static readonly TOKEN_KEY = 'auth_token'
  private static readonly USER_KEY = 'auth_user'
  private static readonly SESSION_KEY = 'auth_session'

  /**
   * Store token in multiple locations for redundancy and security
   */
  static setToken(token: string, user: any, rememberMe: boolean = true) {
    try {
      // 1. HttpOnly Cookie (most secure, handled by server) - Manual client-side cookie as fallback
      const maxAge = rememberMe ? 7 * 24 * 60 * 60 : 24 * 60 * 60 // 7 days or 1 day
      const secure = process.env.NODE_ENV === 'production' ? '; Secure' : ''
      document.cookie = `token=${token}; path=/; max-age=${maxAge}; SameSite=Strict${secure}`
      
      // Also set a non-httpOnly cookie for client-side access (less secure but needed for client checks)
      document.cookie = `auth_token=${token}; path=/; max-age=${maxAge}; SameSite=Strict${secure}`
      
      // 2. localStorage for persistent storage (if remember me)
      if (rememberMe) {
        localStorage.setItem(this.TOKEN_KEY, token)
        localStorage.setItem(this.USER_KEY, JSON.stringify(user))
      }
      
      // 3. sessionStorage for current session
      sessionStorage.setItem(this.SESSION_KEY, JSON.stringify({
        token,
        user,
        timestamp: Date.now()
      }))
      
      console.log('✅ Token stored successfully:', {
        cookie: 'set',
        authCookie: 'set',
        localStorage: rememberMe ? 'set' : 'skipped',
        sessionStorage: 'set'
      })
      
      return true
    } catch (error) {
      console.error('❌ Error storing token:', error)
      return false
    }
  }

  /**
   * Get token from multiple sources with priority order
   */
  static getToken(): string | null {
    try {
      // Priority 1: Cookie (most reliable)
      const cookieToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1]
      
      if (cookieToken) {
        console.log('🍪 Token found in cookie')
        return cookieToken
      }

      // Priority 1b: Auth cookie (client-side fallback)
      const authCookieToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('auth_token='))
        ?.split('=')[1]
      
      if (authCookieToken) {
        console.log('🍪 Token found in auth_token cookie')
        return authCookieToken
      }

      // Priority 2: sessionStorage (current session)
      const sessionData = sessionStorage.getItem(this.SESSION_KEY)
      if (sessionData) {
        const parsed = JSON.parse(sessionData)
        // Check if session is not too old (24 hours max)
        if (Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) {
          console.log('📱 Token found in sessionStorage')
          return parsed.token
        } else {
          console.log('⚠️ Session token expired, removing...')
          sessionStorage.removeItem(this.SESSION_KEY)
        }
      }

      // Priority 3: localStorage (persistent)
      const localToken = localStorage.getItem(this.TOKEN_KEY)
      if (localToken) {
        console.log('💾 Token found in localStorage')
        return localToken
      }

      console.log('❌ No token found in any storage')
      return null
    } catch (error) {
      console.error('❌ Error getting token:', error)
      return null
    }
  }

  /**
   * Get user data from storage
   */
  static getUser(): any | null {
    try {
      // Priority 1: sessionStorage (most recent)
      const sessionData = sessionStorage.getItem(this.SESSION_KEY)
      if (sessionData) {
        const parsed = JSON.parse(sessionData)
        if (Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) {
          console.log('📱 User found in sessionStorage')
          return parsed.user
        }
      }

      // Priority 2: localStorage (persistent)
      const userData = localStorage.getItem(this.USER_KEY)
      if (userData) {
        console.log('💾 User found in localStorage')
        return JSON.parse(userData)
      }

      console.log('❌ No user data found')
      return null
    } catch (error) {
      console.error('❌ Error getting user:', error)
      return null
    }
  }

  /**
   * Clear all token storage
   */
  static clearToken() {
    try {
      // Clear both cookies
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
      document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
      
      // Clear localStorage
      localStorage.removeItem(this.TOKEN_KEY)
      localStorage.removeItem(this.USER_KEY)
      
      // Clear sessionStorage
      sessionStorage.removeItem(this.SESSION_KEY)
      
      console.log('✅ All tokens cleared')
      return true
    } catch (error) {
      console.error('❌ Error clearing tokens:', error)
      return false
    }
  }

  /**
   * Check if any token exists
   */
  static hasToken(): boolean {
    return this.getToken() !== null
  }

  /**
   * Get storage info for debugging
   */
  static getStorageInfo() {
    const cookieToken = document.cookie.includes('token=')
    const localToken = localStorage.getItem(this.TOKEN_KEY)
    const sessionToken = sessionStorage.getItem(this.SESSION_KEY)
    
    return {
      cookie: cookieToken ? 'exists' : 'empty',
      localStorage: localToken ? 'exists' : 'empty',
      sessionStorage: sessionToken ? 'exists' : 'empty',
      tokenLength: this.getToken()?.length || 0
    }
  }
}
