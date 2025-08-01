'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Mail, Lock, ArrowRight, Wallet, ArrowLeft, Check, Eye, EyeOff } from 'lucide-react'
import { PremiumButton } from '@/components/ui/premium-button'
import { StarBorder } from '@/components/ui/star-border'
import { PremiumCard } from '@/components/ui/premium-card'
import { PremiumInput } from '@/components/ui/premium-input'
import { useAuth } from '@/lib/contexts/AuthContext'
import { useWallet } from '@/hooks/useWallet'

export default function LoginPage() {
  const router = useRouter()
  const { login, user, isLoading: authLoading } = useAuth()
  const { connectWallet, address, isConnecting } = useWallet()
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // Redirect to dashboard if user is already logged in
  useEffect(() => {
    if (!authLoading && user) {
      router.push('/dashboard')
    }
  }, [user, authLoading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      console.log('🔐 Starting login request...')
      
      const requestBody = {
        email: formData.email,
        password: formData.password,
        loginMethod: 'email'
      }
      
      console.log('📤 Request body:', requestBody)
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      console.log('📋 Response status:', response.status)
      console.log('📋 Response ok:', response.ok)
      console.log('📋 Response headers:', Object.fromEntries(response.headers.entries()))

      let data
      try {
        const responseText = await response.text()
        console.log('📋 Raw response length:', responseText?.length || 0)
        console.log('📋 Raw response:', responseText?.substring(0, 200) + (responseText?.length > 200 ? '...' : ''))
        
        if (!responseText || responseText.trim() === '') {
          throw new Error('Empty response from server')
        }
        
        // Check if response looks like HTML (error page)
        if (responseText.trim().startsWith('<')) {
          throw new Error('Server returned an error page instead of JSON')
        }
        
        data = JSON.parse(responseText)
        console.log('📋 Parsed response:', data)
      } catch (parseError) {
        console.error('❌ Response parsing error:', parseError)
        throw new Error('Invalid response from server. Please check your internet connection and try again.')
      }

      if (!response.ok) {
        throw new Error(data?.error || `Server error: ${response.status}`)
      }

      if (!data.token || !data.user) {
        throw new Error('Invalid response: missing token or user data')
      }

      console.log('✅ Login successful, calling AuthContext login...')
      // Use the login function from AuthContext with remember me option
      login(data.token, data.user, formData.rememberMe)
      
      // Wait longer for cookies to be fully set before redirecting
      setTimeout(() => {
        console.log('🔄 Redirecting to dashboard after cookie sync...')
        window.location.href = '/dashboard' // Use location.href for full reload to ensure cookies are available
      }, 500)
    } catch (error: any) {
      console.error('❌ Login error:', error)
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
            const response = await fetch('/api/auth/login', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                walletAddress: address,
                loginMethod: 'wallet'
              }),
            })

            const data = await response.json()

            if (!response.ok) {
              throw new Error(data.error || 'Wallet login failed')
            }

            // Use the login function from AuthContext
            login(data.token, data.user)
            
            // Wait for cookies to be set before redirecting
            setTimeout(() => {
              console.log('🔄 Redirecting to dashboard after wallet login...')
              window.location.href = '/dashboard'
            }, 500)
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
                <StarBorder
                  as="button"
                  type="submit"
                  className="w-full"
                  color="#3B82F6"
                  speed="4s"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Signing In...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <span>Sign In</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  )}
                </StarBorder>
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
              <StarBorder
                as="button"
                type="button"
                className="w-full"
                color="#8B5CF6"
                speed="5s"
                onClick={handleWalletConnect}
                disabled={isLoading || isConnecting}
              >
                <div className="flex items-center justify-center gap-2">
                  <Wallet className="w-4 h-4" />
                  {isConnecting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 border-2 border-gray-400 border-t-white rounded-full animate-spin" />
                      <span>Connecting...</span>
                    </div>
                  ) : (
                    'Connect Wallet'
                  )}
                </div>
              </StarBorder>
            </motion.div>

            {/* Register Link */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-center mt-8 pt-6 border-t border-gray-800"
            >
              <p className="text-gray-400 mb-3">
                Don't have an account?{' '}
                <Link
                  href="/register"
                  className="text-blue-400 hover:text-blue-300 transition-colors font-medium"
                >
                  Sign up for free
                </Link>
              </p>
              <p className="text-gray-400">
                Have an invite code?{' '}
                <Link
                  href="/code-register"
                  className="text-accent-slate hover:text-accent-teal transition-colors font-medium"
                >
                  Join with invite code
                </Link>
              </p>
            </motion.div>
          </PremiumCard>
        </motion.div>
      </div>
    </div>
  )
}
