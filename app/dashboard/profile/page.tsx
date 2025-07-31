'use client'

import { motion } from 'framer-motion'
import { UserProfile, UserStats, UserActivity } from '@/components/user'
import { PremiumCard } from '@/components/ui/premium-card'
import { useAuth } from '@/lib/contexts/AuthContext'
import { redirect } from 'next/navigation'

export default function ProfilePage() {
  const { user, isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    redirect('/login')
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
        <motion.div variants={itemVariants} className="space-y-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-accent-slate to-accent-teal bg-clip-text text-transparent">
              My Profile
            </h1>
            <p className="text-gray-400 mt-2">
              Manage your account information and view your activity
            </p>
          </div>
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