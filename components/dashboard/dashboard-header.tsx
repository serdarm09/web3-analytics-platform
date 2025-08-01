'use client'

import { User, Menu, Mail, Calendar, Wallet, CheckCircle } from 'lucide-react'
import { PremiumBadge } from '@/components/ui/premium-badge'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/lib/contexts/AuthContext'

interface DashboardHeaderProps {
  onMenuClick?: () => void;
}

export function DashboardHeader({ onMenuClick }: DashboardHeaderProps) {
  const [showProfile, setShowProfile] = useState(false)
  const { user, logout } = useAuth()

  return (
    <header className="h-16 bg-black-primary border-b border-gray-border px-4 sm:px-6 flex items-center justify-between"
      onClick={() => {
        // Close dropdowns when clicking outside
        setShowProfile(false)
      }}
    >
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

        {/* Profile */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation()
              setShowProfile(!showProfile)
            }}
            className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-secondary transition-colors"
          >
            <div className="relative">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">
                  {user?.username?.charAt(0).toUpperCase() || user?.name?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              {user?.isVerified && (
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900 flex items-center justify-center">
                  <CheckCircle className="w-2.5 h-2.5 text-white" />
                </div>
              )}
            </div>
            
            <div className="hidden sm:block text-left">
              <div className="flex items-center gap-2">
                <span className="text-white text-sm font-medium">
                  {user?.username || user?.name || 'User'}
                </span>
                {user?.isVerified && (
                  <CheckCircle className="w-4 h-4 text-green-400" />
                )}
              </div>
              <div className="text-xs text-gray-400">
                {user?.isVerified ? 'Verified Account' : 'Unverified'}
              </div>
            </div>
          </button>

          <AnimatePresence>
            {showProfile && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute right-0 top-full mt-2 w-64 glassmorphism rounded-lg p-4 z-50"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="pb-3 border-b border-gray-border">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-lg font-bold">
                          {user?.username?.charAt(0).toUpperCase() || user?.name?.charAt(0).toUpperCase() || 'U'}
                        </span>
                      </div>
                      {user?.isVerified && (
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-gray-900 flex items-center justify-center">
                          <CheckCircle className="w-3.5 h-3.5 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-white">{user?.username || user?.name || 'User'}</p>
                        {user?.isVerified && (
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        )}
                      </div>
                      <p className="text-xs text-gray-400">
                        {user?.isVerified ? 'Verified Account' : 'Unverified Account'}
                      </p>
                    </div>
                  </div>
                  
                  {/* User Details */}
                  <div className="space-y-2 mt-3">
                    {user?.email && (
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Mail className="w-3 h-3" />
                        <span>{user.email}</span>
                      </div>
                    )}
                    {user?.walletAddress && (
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Wallet className="w-3 h-3" />
                        <span>{user.walletAddress.slice(0, 6)}...{user.walletAddress.slice(-4)}</span>
                      </div>
                    )}
                    {user?.createdAt && (
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Calendar className="w-3 h-3" />
                        <span>Member since {new Date(user.createdAt).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="pt-3 space-y-2">
                  <a href="/dashboard/profile" className="block px-3 py-2 text-sm text-gray-300 hover:bg-gray-secondary rounded-lg transition-colors">
                    View Profile
                  </a>
                  <a href="/dashboard/settings" className="block px-3 py-2 text-sm text-gray-300 hover:bg-gray-secondary rounded-lg transition-colors">
                    Account Settings
                  </a>
                  <div className="pt-2 mt-2 border-t border-gray-border">
                    <button 
                      onClick={() => logout()}
                      className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-gray-secondary rounded-lg transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  )
}