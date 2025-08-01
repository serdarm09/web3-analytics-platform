"use client"

import { useAuth } from '@/hooks/use-auth'

export default function TestLogout() {
  const { logout, user, isAuthenticated } = useAuth()

  const handleLogout = async () => {
    console.log('🧪 Test logout clicked')
    console.log('📋 Current state:', { user: user?.email, isAuthenticated })
    
    // Show current cookies before logout
    console.log('🍪 Current cookies:', document.cookie)
    
    try {
      await logout()
    } catch (error) {
      console.error('❌ Logout error:', error)
    }
  }

  const checkCookies = () => {
    console.log('🍪 Current cookies:', document.cookie)
    console.log('📋 Current state:', { user: user?.email, isAuthenticated })
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Logout Test Page</h1>
      
      <div className="space-y-4">
        <div>
          <p>User: {user?.email || 'Not logged in'}</p>
          <p>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</p>
        </div>
        
        <button 
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Test Logout
        </button>
        
        <button 
          onClick={checkCookies}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 ml-4"
        >
          Check Cookies
        </button>
      </div>
    </div>
  )
}
