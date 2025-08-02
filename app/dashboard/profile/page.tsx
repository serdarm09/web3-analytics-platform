'use client'

import { motion } from 'framer-motion'
import { UserProfile, UserStats, UserActivity } from '@/components/user'
import { PremiumCard } from '@/components/ui/premium-card'
import { useAuth } from '@/lib/contexts/AuthContext'
import { redirect } from 'next/navigation'
import { RefreshCw } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

export default function ProfilePage() {
  const { user, isAuthenticated, checkAuth } = useAuth()
  const [refreshing, setRefreshing] = useState(false)

  if (!isAuthenticated) {
    redirect('/login')
  }

  const refreshProfile = async () => {
    setRefreshing(true)
    try {
      await checkAuth()
      toast.success('Profile data refreshed!')
    } catch (error) {
      toast.error('Failed to refresh profile')
    } finally {
      setRefreshing(false)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-900/30 p-4 md:p-6 lg:p-8">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-7xl mx-auto space-y-8"
      >
        {/* Page Header */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-accent-slate to-accent-teal bg-clip-text text-transparent">
              My Profile
            </h1>
            <p className="text-gray-400 mt-2">
              Manage your account information and view your activity
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={refreshProfile}
            disabled={refreshing}
            className="px-4 py-2 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-600 rounded-lg text-white text-sm font-medium transition-all duration-200 disabled:opacity-50 flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh Data'}
          </motion.button>
        </motion.div>

        {/* User Profile Card */}
        <motion.div variants={itemVariants}>
          <UserProfile />
        </motion.div>

        {/* User Statistics */}
        <motion.div variants={itemVariants}>
          <UserStats />
        </motion.div>

        {/* User Activity */}
        <motion.div variants={itemVariants}>
          <UserActivity />
        </motion.div>
      </motion.div>
    </div>
  )
}