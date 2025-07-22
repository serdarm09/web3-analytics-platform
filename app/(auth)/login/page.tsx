'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Mail, Lock, ArrowRight, Wallet, ArrowLeft, Check, Eye, EyeOff } from 'lucide-react'
import { PremiumButton } from '@/components/ui/premium-button'
import { PremiumCard } from '@/components/ui/premium-card'
import { PremiumInput } from '@/components/ui/premium-input'
import { useAuth } from '@/hooks/use-auth'
import { useWallet } from '@/hooks/useWallet'

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const { connectWallet, address, isConnecting } = useWallet()
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      await login({
        email: formData.email,
        password: formData.password,
        loginMethod: 'email'
      })
      router.push('/dashboard')
    } catch (error: any) {
      setError(error.message || 'Login failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleWalletConnect = async () => {
    setError('')
    setIsLoading(true)

    try {
      await connectWallet()
      
      // Wait a bit for the state to update
      setTimeout(async () => {
        if (address) {
          // Try to login with wallet
          try {
            await login({
              walletAddress: address,
              loginMethod: 'wallet'
            } as any)
            router.push('/dashboard')
          } catch (error: any) {
            setError('Failed to login with wallet. Please try again.')
          }
        } else {
          setError('Failed to connect wallet. Please try again.')
        }
        setIsLoading(false)
      }, 1000)
    } catch (error: any) {
      setError('Failed to connect wallet. Please try again.')
      setIsLoading(false)
    }
  }

  // Custom Checkbox Component
  const CustomCheckbox = ({ 
    checked, 
    onChange, 
    children 
  }: {
    checked: boolean
    onChange: (checked: boolean) => void
    children: React.ReactNode
  }) => (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`flex-shrink-0 w-5 h-5 rounded-md border-2 transition-all duration-200 flex items-center justify-center ${
          checked 
            ? 'bg-gradient-to-r from-blue-500 to-purple-600 border-blue-500 text-white' 
            : 'border-gray-600 hover:border-gray-500 bg-gray-800/50'
        }`}
      >
        {checked && <Check className="w-3 h-3" />}
      </button>
      <div className="text-sm text-gray-300 cursor-pointer" onClick={() => onChange(!checked)}>
        {children}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-purple-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Back Button */}
      <Link
        href="/"
        className="absolute top-8 left-8 flex items-center gap-2 text-gray-400 hover:text-white transition-colors z-10"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Home</span>
      </Link>

      <div className="relative z-10 w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <PremiumCard variant="glass" className="p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <motion.h1
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-3xl font-bold text-white mb-2"
              >
                Welcome Back
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-gray-400"
              >
                Sign in to your Web3 Analytics account
              </motion.p>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm"
              >
                {error}
              </motion.div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <PremiumInput
                  icon={Mail}
                  type="email"
                  placeholder="Email address"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="relative"
              >
                <PremiumInput
                  icon={Lock}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </motion.div>

              {/* Remember Me */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex items-center justify-between"
              >
                <CustomCheckbox
                  checked={formData.rememberMe}
                  onChange={(checked) => setFormData({ ...formData, rememberMe: checked })}
                >
                  Remember me
                </CustomCheckbox>
                
                <Link
                  href="/forgot-password"
                  className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Forgot password?
                </Link>
              </motion.div>

              {/* Submit Button */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <PremiumButton
                  type="submit"
                  variant="gradient"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-500 hover:to-purple-600"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Signing In...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span>Sign In</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  )}
                </PremiumButton>
              </motion.div>
            </form>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-gray-900/80 text-gray-400">Or continue with</span>
              </div>
            </div>

            {/* Wallet Connect */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <PremiumButton
                variant="outline"
                className="w-full border-gray-700 hover:border-gray-600 hover:bg-gray-800/50"
                onClick={handleWalletConnect}
                disabled={isLoading || isConnecting}
              >
                <Wallet className="w-4 h-4 mr-2" />
                {isConnecting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 border-2 border-gray-400 border-t-white rounded-full animate-spin" />
                    <span>Connecting...</span>
                  </div>
                ) : (
                  'Connect Wallet'
                )}
              </PremiumButton>
            </motion.div>

            {/* Register Link */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-center mt-8 pt-6 border-t border-gray-800"
            >
              <p className="text-gray-400">
                Don't have an account?{' '}
                <Link
                  href="/register"
                  className="text-blue-400 hover:text-blue-300 transition-colors font-medium"
                >
                  Sign up for free
                </Link>
              </p>
            </motion.div>
          </PremiumCard>
        </motion.div>
      </div>
    </div>
  )
}
