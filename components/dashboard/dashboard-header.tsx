'use client'

import { Bell, User, Menu } from 'lucide-react'
import { PremiumBadge } from '@/components/ui/premium-badge'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/hooks/use-auth'

interface DashboardHeaderProps {
  onMenuClick?: () => void;
}

export function DashboardHeader({ onMenuClick }: DashboardHeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const { user, logout } = useAuth()

  const notifications = [
    {
      id: 1,
      title: 'BTC Price Alert',
      message: 'Bitcoin reached $45,000',
      time: '5 min ago',
      type: 'price' as const,
    },
    {
      id: 2,
      title: 'Whale Movement',
      message: '1000 ETH moved to Binance',
      time: '1 hour ago',
      type: 'whale' as const,
    },
    {
      id: 3,
      title: 'New Trending Project',
      message: 'PEPE is trending with +150%',
      time: '3 hours ago',
      type: 'trending' as const,
    },
  ]

  return (
    <header className="h-16 bg-black-primary border-b border-gray-border px-4 sm:px-6 flex items-center justify-between">
      {/* Mobile Menu Button */}
      <button
        onClick={onMenuClick}
        className="p-2 rounded-lg hover:bg-gray-secondary transition-colors lg:hidden"
      >
        <Menu className="w-5 h-5 text-white" />
      </button>

      {/* Spacer */}
      <div className="flex-1"></div>

      {/* Right Section */}
      <div className="flex items-center space-x-4">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg hover:bg-gray-secondary transition-colors"
          >
            <Bell className="w-5 h-5 text-white-secondary" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-accent-red rounded-full" />
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute right-0 top-full mt-2 w-80 glassmorphism rounded-lg p-4 z-50"
              >
                <h3 className="font-semibold text-white mb-3">Notifications</h3>
                <div className="space-y-3">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="p-3 bg-gray-secondary rounded-lg hover:bg-gray-secondary/80 transition-colors cursor-pointer"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-white text-sm">{notification.title}</p>
                          <p className="text-gray-400 text-xs mt-1">{notification.message}</p>
                        </div>
                        <span className="text-xs text-gray-400 ml-2">{notification.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-3 text-center text-sm text-accent-blue hover:underline">
                  View all notifications
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-secondary transition-colors"
          >
            <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <PremiumBadge variant="success" size="sm">
              Pro
            </PremiumBadge>
          </button>

          <AnimatePresence>
            {showProfile && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute right-0 top-full mt-2 w-64 glassmorphism rounded-lg p-4 z-50"
              >
                <div className="flex items-center space-x-3 pb-3 border-b border-gray-border">
                  <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-white">{user?.username || 'User'}</p>
                    <p className="text-xs text-gray-400">{user?.email || 'No email'}</p>
                  </div>
                </div>
                <div className="pt-3 space-y-2">
                  <a href="/dashboard/settings" className="block px-3 py-2 text-sm text-gray-300 hover:bg-gray-secondary rounded-lg transition-colors">
                    Account Settings
                  </a>
                  <a href="/dashboard/settings#billing" className="block px-3 py-2 text-sm text-gray-300 hover:bg-gray-secondary rounded-lg transition-colors">
                    Billing & Plans
                  </a>
                  <button 
                    onClick={() => logout()}
                    className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-secondary rounded-lg transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  )
}