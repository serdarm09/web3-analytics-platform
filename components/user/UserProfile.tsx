'use client'

import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/use-auth'
import { 
  User, 
  Mail, 
  Wallet, 
  Calendar, 
  Shield, 
  Crown, 
  Settings,
  Edit2,
  Copy,
  CheckCircle
} from 'lucide-react'
import { PremiumCard } from '@/components/ui/premium-card'
import { PremiumBadge } from '@/components/ui/premium-badge'
import { PremiumButton } from '@/components/ui/premium-button'
import { useState } from 'react'
import { toast } from 'sonner'

interface UserProfileProps {
  showActions?: boolean
  compact?: boolean
}

export function UserProfile({ showActions = true, compact = false }: UserProfileProps) {
  const { user } = useAuth()
  const [copied, setCopied] = useState(false)

  if (!user) return null

  const copyAddress = async () => {
    if (user.walletAddress) {
      await navigator.clipboard.writeText(user.walletAddress)
      setCopied(true)
      toast.success('Wallet address copied!')
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const getSubscriptionColor = (subscription: string) => {
    switch (subscription) {
      case 'pro':
        return 'from-blue-500 to-cyan-500'
      case 'enterprise':
        return 'from-purple-500 to-pink-500'
      default:
        return 'from-gray-500 to-gray-600'
    }
  }

  const getSubscriptionLabel = (subscription: string) => {
    return subscription.charAt(0).toUpperCase() + subscription.slice(1)
  }

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-3 p-3 bg-gray-900/50 rounded-lg border border-gray-700"
      >
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
          <span className="text-white font-bold text-sm">
            {user.username?.charAt(0).toUpperCase() || user.name?.charAt(0).toUpperCase() || 'U'}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-white truncate">
            {user.username || user.name || 'User'}
          </div>
          <div className="text-xs text-gray-400 truncate">
            {user.email || (user.walletAddress ? `${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-4)}` : 'No email')}
          </div>
        </div>
        <PremiumBadge variant="outline" className="text-xs">
          {getSubscriptionLabel(user.subscription || 'free')}
        </PremiumBadge>
      </motion.div>
    )
  }

  return (
    <PremiumCard className="bg-gray-900/50 backdrop-blur-xl border border-gray-700">
      <div className="p-6">
        <div className="flex flex-col md:flex-row md:items-start gap-6">
          {/* Avatar & Basic Info */}
          <div className="flex flex-col items-center md:items-start">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="relative mb-4"
            >
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-2xl">
                <span className="text-white text-3xl font-bold">
                  {user.username?.charAt(0).toUpperCase() || user.name?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 rounded-full border-4 border-gray-900 flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
            </motion.div>

            <div className={`px-4 py-2 rounded-full bg-gradient-to-r ${getSubscriptionColor(user.subscription || 'free')} text-white text-sm font-medium shadow-lg`}>
              <Crown className="w-4 h-4 inline mr-2" />
              {getSubscriptionLabel(user.subscription || 'free')} Plan
            </div>
          </div>

          {/* User Details */}
          <div className="flex-1 space-y-4">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">
                {user.name || user.username || 'Web3 User'}
              </h2>
              <p className="text-gray-400">
                {user.username && user.name ? `@${user.username}` : 'Web3 Analytics Platform Member'}
              </p>
            </div>

            {/* User Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-lg"
              >
                <User className="w-5 h-5 text-blue-400" />
                <div>
                  <div className="text-xs text-gray-400">Username</div>
                  <div className="text-white font-medium">
                    {user.username || 'Not set'}
                  </div>
                </div>
              </motion.div>

              {user.email && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-lg"
                >
                  <Mail className="w-5 h-5 text-green-400" />
                  <div>
                    <div className="text-xs text-gray-400">Email</div>
                    <div className="text-white font-medium">{user.email}</div>
                  </div>
                </motion.div>
              )}

              {user.walletAddress && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-lg"
                >
                  <Wallet className="w-5 h-5 text-purple-400" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-gray-400">Wallet Address</div>
                    <div className="text-white font-medium font-mono text-sm truncate">
                      {user.walletAddress}
                    </div>
                  </div>
                  <PremiumButton
                    variant="ghost"
                    size="sm"
                    onClick={copyAddress}
                    className="ml-2"
                  >
                    {copied ? (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </PremiumButton>
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-lg"
              >
                <Calendar className="w-5 h-5 text-orange-400" />
                <div>
                  <div className="text-xs text-gray-400">Member Since</div>
                  <div className="text-white font-medium">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Recently'}
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-lg"
              >
                <Shield className="w-5 h-5 text-red-400" />
                <div>
                  <div className="text-xs text-gray-400">Registration Method</div>
                  <div className="text-white font-medium capitalize">
                    {user.registrationMethod || 'Email'}
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-lg"
              >
                <CheckCircle className="w-5 h-5 text-green-400" />
                <div>
                  <div className="text-xs text-gray-400">Account Status</div>
                  <div className="text-white font-medium">
                    {user.isVerified ? 'Verified' : 'Unverified'}
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Actions */}
            {showActions && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="flex flex-wrap gap-3 pt-4 border-t border-gray-700"
              >
                <PremiumButton variant="outline" size="sm">
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit Profile
                </PremiumButton>
                <PremiumButton variant="outline" size="sm">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </PremiumButton>
                {user.subscription === 'free' && (
                  <PremiumButton size="sm">
                    <Crown className="w-4 h-4 mr-2" />
                    Upgrade Plan
                  </PremiumButton>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </PremiumCard>
  )
}