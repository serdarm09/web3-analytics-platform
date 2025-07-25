'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Sidebar } from '@/components/dashboard/sidebar'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/use-auth'
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
  const pathname = usePathname();

  // Check if current page is public
  const isPublicPage = pathname === '/dashboard/watchlist';

  useEffect(() => {
    console.log('🔐 Dashboard Layout Auth Check:', { user: !!user, isLoading, isAuthenticated, pathname })
    
    // Skip authentication check for public pages
    if (!isPublicPage && !isLoading && !isAuthenticated) {
      console.log('❌ User not authenticated, redirecting to login')
      router.push('/login')
      return
    }
  }, [user, isLoading, isAuthenticated, router, isPublicPage, pathname])

  // Show loading state
  if (isLoading && !isPublicPage) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-slate"></div>
      </div>
    );
  }

  // Show redirect state for protected pages
  if (!isPublicPage && (!isAuthenticated || !user)) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <div className="text-white">Redirecting to login...</div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-black-primary">
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
      <div className={`fixed inset-y-0 left-0 z-50 transition-all duration-300 ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}`}>
        <Sidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
          onCollapsedChange={setIsCollapsed}
        />
      </div>
      
      {/* Main Content */}
      <div className={`flex h-full flex-col transition-all duration-300 ${isCollapsed ? 'lg:pl-20' : 'lg:pl-64'}`}>
        {/* Header */}
        <DashboardHeader onMenuClick={() => setSidebarOpen(true)} />
        
        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-black-secondary">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  )
}