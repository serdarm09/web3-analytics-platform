'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  Wallet,
  FolderOpen,
  TrendingUp,
  Eye,
  Activity,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  X,
  User,
  Shield
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/contexts/AuthContext'

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  onCollapsedChange?: (collapsed: boolean) => void;
}

export function Sidebar({ isOpen = true, onClose, onCollapsedChange }: SidebarProps) {
  const pathname = usePathname()
  const { logout, user } = useAuth()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Dynamic sidebar items based on user role
  const getSidebarItems = () => {
    const baseItems = [
      {
        title: 'Dashboard',
        icon: LayoutDashboard,
        href: '/dashboard',
      },
      {
        title: 'Portfolio',
        icon: Wallet,
        href: '/dashboard/portfolio',
      },
      {
        title: 'Projects',
        icon: FolderOpen,
        href: '/dashboard/projects',
      },
      {
        title: 'Trending',
        icon: TrendingUp,
        href: '/dashboard/trending',
      },
      {
        title: 'Watch Projects',
        icon: Eye,
        href: '/dashboard/watchlist',
      },
      {
        title: 'Whale Tracker',
        icon: Activity,
        href: '/dashboard/whale-tracker',
      },
      {
        title: 'Analytics',
        icon: BarChart3,
        href: '/dashboard/analytics',
      },
      {
        title: 'Profile',
        icon: User,
        href: '/dashboard/profile',
      },
    ]

    // Add admin link if user is admin
    if (user?.role === 'admin') {
      baseItems.push({
        title: 'Admin Panel',
        icon: Shield,
        href: '/dashboard/admin',
      })
    }

    return baseItems
  }

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    // Notify parent of collapse state changes
    onCollapsedChange?.(isCollapsed)
  }, [isCollapsed, onCollapsedChange])

  const handleLogout = () => {
    logout()
  }

  return (
    <div
      className={cn(
        "h-full bg-gray-primary border-r border-gray-border flex flex-col",
        isCollapsed && !isMobile ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="p-6 border-b border-gray-border flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center space-x-3">
          <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-900 rounded-lg border border-gray-600/30">
            {/* VelocityCrypto SVG Logo */}
            <svg width="18" height="18" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="sidebarLogoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{stopColor:"#00D4FF", stopOpacity:1}} />
                  <stop offset="30%" style={{stopColor:"#3B82F6", stopOpacity:1}} />
                  <stop offset="70%" style={{stopColor:"#8B5CF6", stopOpacity:1}} />
                  <stop offset="100%" style={{stopColor:"#06B6D4", stopOpacity:1}} />
                </linearGradient>
              </defs>
              
              {/* V Shape for Velocity */}
              <path d="M7 9 L18 26 L29 9" stroke="url(#sidebarLogoGradient)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
              
              {/* Speed Lines */}
              <path d="M4 12 L6 12" stroke="url(#sidebarLogoGradient)" strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.8"/>
              <path d="M4.5 16 L7.5 16" stroke="url(#sidebarLogoGradient)" strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.6"/>
              <path d="M30 12 L32 12" stroke="url(#sidebarLogoGradient)" strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.8"/>
              <path d="M28.5 16 L31.5 16" stroke="url(#sidebarLogoGradient)" strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.6"/>
              
              {/* Crypto Elements */}
              <circle cx="18" cy="7" r="0.8" fill="url(#sidebarLogoGradient)" opacity="0.9"/>
              <circle cx="15" cy="20" r="0.6" fill="url(#sidebarLogoGradient)" opacity="0.7"/>
              <circle cx="21" cy="20" r="0.6" fill="url(#sidebarLogoGradient)" opacity="0.7"/>
            </svg>
          </div>
          {(!isCollapsed || isMobile) && (
            <span className="text-xl font-bold text-white">VelocityCrypto</span>
          )}
        </Link>
        {isMobile && (
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-secondary transition-colors lg:hidden"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        )}
        {!isMobile && (
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-lg hover:bg-gray-secondary transition-colors hidden lg:block"
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4 text-white" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-white" />
            )}
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-1">
        {getSidebarItems().map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center px-3 py-2.5 rounded-lg transition-all duration-200",
                "hover:bg-gray-secondary",
                isActive && "bg-gray-secondary text-white",
                !isActive && "text-white-secondary"
              )}
            >
              <item.icon className={cn("w-5 h-5 flex-shrink-0", isCollapsed && !isMobile && "mx-auto")} />
              {(!isCollapsed || isMobile) && (
                <span className="ml-3 font-medium">{item.title}</span>
              )}
              {isActive && !isCollapsed && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute left-0 w-1 h-8 bg-gradient-primary rounded-r-full"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Bottom Section */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-border">
        <Link
          href="/dashboard/settings"
          className={cn(
            "flex items-center px-3 py-2.5 rounded-lg transition-all duration-200",
            "hover:bg-gray-secondary text-white-secondary mb-2"
          )}
        >
          <Settings className={cn("w-5 h-5 flex-shrink-0", isCollapsed && !isMobile && "mx-auto")} />
          {(!isCollapsed || isMobile) && <span className="ml-3 font-medium">Settings</span>}
        </Link>
        
        <button
          onClick={handleLogout}
          className={cn(
            "flex items-center w-full px-3 py-2.5 rounded-lg transition-all duration-200",
            "hover:bg-gray-secondary text-white-secondary"
          )}
        >
          <LogOut className={cn("w-5 h-5 flex-shrink-0", isCollapsed && !isMobile && "mx-auto")} />
          {(!isCollapsed || isMobile) && <span className="ml-3 font-medium">Logout</span>}
        </button>
      </div>

      {/* Collapse Toggle - Only show on desktop */}
      {!isMobile && (
        <button
          onClick={() => {
            const newCollapsed = !isCollapsed
            setIsCollapsed(newCollapsed)
            onCollapsedChange?.(newCollapsed)
          }}
          className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-gray-secondary border border-gray-border rounded-full flex items-center justify-center text-white-secondary hover:text-white transition-colors"
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      )}
    </div>
  )
}