'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/dashboard/sidebar'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { motion } from 'framer-motion'
import { useAuth } from '@/lib/contexts/AuthContext'
import { TokenManager } from '@/lib/utils/tokenManager'
import { toast } from 'sonner'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const storageInfo = TokenManager.getStorageInfo()
    console.log('🔐 Dashboard Layout Auth Check:', { 
      user: !!user, 
      isLoading, 
      isAuthenticated,
      userEmail: user?.email || 'none',
      storageInfo
    })
    
    // Only redirect if we're sure we're not loading and definitely not authenticated
    if (!isLoading && !isAuthenticated && !user && !TokenManager.hasToken()) {
      console.log('❌ User definitely not authenticated, redirecting to login')
      router.push('/login?returnTo=/dashboard')
      return
    }

    // If we have a token but no user/auth state, something might be wrong with state sync
    if (!isLoading && !isAuthenticated && TokenManager.hasToken()) {
      console.log('⚠️ Token exists but auth state not synced - this should resolve automatically')
      console.log('📊 Detailed storage info:', storageInfo)
    }
  }, [user, isLoading, isAuthenticated, router])

  // Show loading state
  if (isLoading) {
    console.log('📊 Dashboard: Showing loading state')
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-slate"></div>
      </div>
    );
  }

  // Show redirect state ONLY if we're sure there's no authentication
  if (!isLoading && !isAuthenticated && !user) {
    console.log('🔄 Dashboard: Showing redirect state - no auth detected')
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <div className="text-white">Redirecting to login...</div>
      </div>
    );
  }

  // If we have EITHER authentication OR user data, show the dashboard
  if (!isLoading && (isAuthenticated || user)) {
    console.log('✅ Dashboard: Showing dashboard content')
    return (
      <div className="flex min-h-screen bg-black-secondary">
        {/* Mobile sidebar backdrop */}
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        {/* Sidebar */}
        <div className={`fixed inset-y-0 left-0 z-50 transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'} lg:relative lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <Sidebar 
            isOpen={sidebarOpen} 
            onClose={() => setSidebarOpen(false)} 
            onCollapsedChange={setIsCollapsed}
          />
        </div>
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <DashboardHeader onMenuClick={() => setSidebarOpen(true)} />
          
          {/* Page Content */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="max-w-7xl mx-auto"
            >
              {children}
            </motion.div>
          </main>
        </div>
      </div>
    );
  }

  // Default loading state - keep this simpler and consistent
  return (
    <div className="h-screen bg-black flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-slate"></div>
    </div>
  )
}