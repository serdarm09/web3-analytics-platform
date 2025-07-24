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
  User
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'

const sidebarItems = [
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
    title: 'Wallet Tracker',
    icon: Activity,
    href: '/dashboard/wallet-tracker',
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

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  onCollapsedChange?: (collapsed: boolean) => void;
}

export function Sidebar({ isOpen = true, onClose, onCollapsedChange }: SidebarProps) {
  const pathname = usePathname()
  const { logout } = useAuth()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

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
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ x: isMobile ? -300 : -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: isMobile ? -300 : -20, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className={cn(
          "h-full bg-gray-primary border-r border-gray-border transition-all duration-300",
          isCollapsed && !isMobile ? "w-20" : "w-64",
          isMobile && "fixed left-0 top-0 z-50",
          isMobile && !isOpen && "-translate-x-full"
        )}
      >
      {/* Logo */}
      <div className="p-6 border-b border-gray-border flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex-shrink-0" />
          {(!isCollapsed || isMobile) && (
            <span className="text-xl font-bold text-white">Web3Analytics</span>
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
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-1">
        {sidebarItems.map((item) => {
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
    </motion.div>
    </AnimatePresence>
  )
}